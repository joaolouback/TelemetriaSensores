/**
 * Hook dos pontos já coletados pelo usuário logado.
 *
 * Evita oferecer a câmera de AR em pontos que já renderam pontos. Se a API
 * estiver fora do ar o conjunto fica vazio — o backend recusa coletas
 * repetidas de qualquer forma (HTTP 409).
 */
import { useState, useEffect, useCallback } from 'react';
import { buscarPontosColetados } from '../services/interacoes';
import { useAuth } from '../contexts/AuthContext';

export function useColetas() {
  const { usuario } = useAuth();
  const [coletados, setColetados] = useState<Set<number>>(new Set());

  const carregar = useCallback(async () => {
    try {
      setColetados(new Set(await buscarPontosColetados()));
    } catch (e) {
      console.warn('[useColetas] Falha ao buscar pontos coletados:', e);
    }
  }, []);

  // A pontuação muda a cada check-in: recarregar com ela mantém em dia todas as
  // telas que usam o hook (Mapa e Início ficam montadas ao mesmo tempo).
  useEffect(() => {
    if (usuario) {
      carregar();
    } else {
      setColetados(new Set());
    }
  }, [usuario?.id, usuario?.pontuacaoTotal, carregar]);

  const marcarColetado = useCallback((pontoId: number) => {
    setColetados((anterior) => new Set(anterior).add(pontoId));
  }, []);

  return { coletados, marcarColetado, recarregarColetas: carregar };
}
