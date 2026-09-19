/**
 * Hook dos pontos de coleta do campus.
 *
 * Busca os pontos na API e, a cada nova posição do usuário, recalcula
 * localmente a distância e o estado de geofence (CS03 — Validar Proximidade).
 * O cálculo é feito no aparelho para funcionar mesmo sem rede.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { PontoDeInteresse, PontoComDistancia, LocationData } from '../types';
import { buscarPontos } from '../services/pontos';
import { distanciaEmMetros } from '../utils';

export function usePontos(localizacao: LocationData | null) {
  const [pontos, setPontos] = useState<PontoDeInteresse[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const dados = await buscarPontos();
      setPontos(dados);
      console.log(`[usePontos] ${dados.length} pontos carregados da API.`);
    } catch (e) {
      console.warn('[usePontos] Falha ao buscar pontos:', e);
      setErro('Não foi possível carregar os pontos do campus. Verifique se a API está rodando.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  /** Pontos com distância até o usuário, ordenados do mais perto ao mais longe. */
  const pontosComDistancia = useMemo<PontoComDistancia[]>(() => {
    if (!localizacao) {
      return pontos.map((ponto) => ({
        ...ponto,
        distanciaMetros: Number.NaN,
        dentroDoRaio: false,
      }));
    }

    return pontos
      .map((ponto) => {
        const distancia = distanciaEmMetros(
          localizacao.latitude,
          localizacao.longitude,
          ponto.latitude,
          ponto.longitude
        );

        return {
          ...ponto,
          distanciaMetros: distancia,
          dentroDoRaio: distancia <= ponto.raioGeofence,
        };
      })
      .sort((a, b) => a.distanciaMetros - b.distanciaMetros);
  }, [pontos, localizacao]);

  /** Ponto mais próximo do usuário (ou null se ainda não há posição). */
  const pontoMaisProximo = useMemo<PontoComDistancia | null>(() => {
    if (!localizacao || pontosComDistancia.length === 0) return null;
    return pontosComDistancia[0];
  }, [pontosComDistancia, localizacao]);

  /** Pontos em que o usuário está dentro do raio de geofence agora. */
  const pontosAtivos = useMemo(
    () => pontosComDistancia.filter((p) => p.dentroDoRaio),
    [pontosComDistancia]
  );

  return {
    pontos,
    pontosComDistancia,
    pontoMaisProximo,
    pontosAtivos,
    carregando,
    erro,
    recarregar: carregar,
  };
}
