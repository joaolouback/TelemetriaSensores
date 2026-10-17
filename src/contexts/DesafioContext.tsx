/**
 * Contexto do desafio 1x1.
 *
 * Mantém o desafio atual do usuário (aguardando, em andamento ou o resultado
 * recente) e o atualiza sozinho: a cada poucos segundos durante a partida, para
 * o placar do oponente aparecer, e com menos frequência fora dela. Para enquanto
 * o app está em segundo plano. Início e Mapa leem daqui.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { Desafio } from '../types';
import * as desafiosService from '../services/desafios';
import { buscarPontuacao } from '../services/interacoes';
import { useAuth } from './AuthContext';

/** Partida rolando ou esperando o oponente: o placar muda a qualquer momento. */
const INTERVALO_ATIVO_MS = 5_000;
/** Sem partida: só para descobrir um desafio aceito em outro aparelho. */
const INTERVALO_OCIOSO_MS = 60_000;

interface DesafioContextValue {
  /** O desafio atual, ou null. Um resultado já dispensado pelo usuário não aparece. */
  desafio: Desafio | null;
  /** Ids dos pontos do desafio em andamento que o usuário ainda precisa coletar. */
  pendentes: Set<number>;
  /** Diferença (ms) entre o relógio do servidor e o do celular — para o cronômetro. */
  ajusteRelogio: number;
  criar: () => Promise<void>;
  entrar: (codigo: string) => Promise<void>;
  sair: () => Promise<void>;
  atualizar: () => Promise<void>;
  /** Esconde o card de resultado do desafio terminado. */
  dispensarResultado: () => void;
}

const DesafioContext = createContext<DesafioContextValue | null>(null);

export function DesafioProvider({ children }: { children: React.ReactNode }) {
  const { usuario, atualizarPontuacao } = useAuth();
  const [desafio, setDesafio] = useState<Desafio | null>(null);
  const [ajusteRelogio, setAjusteRelogio] = useState(0);
  const [dispensado, setDispensado] = useState<number | null>(null);
  const [emPrimeiroPlano, setEmPrimeiroPlano] = useState(AppState.currentState === 'active');
  const pontuacaoRef = useRef(usuario?.pontuacaoTotal);
  pontuacaoRef.current = usuario?.pontuacaoTotal;

  const aplicar = useCallback((novo: Desafio | null) => {
    setDesafio(novo);
    if (novo) setAjusteRelogio(new Date(novo.agora).getTime() - Date.now());
  }, []);

  const atualizar = useCallback(async () => {
    try {
      const atual = await desafiosService.buscarDesafioAtual();
      aplicar(atual);
    } catch (e) {
      console.warn('[Desafio] Falha ao atualizar:', e);
    }
  }, [aplicar]);

  const criar = useCallback(async () => aplicar(await desafiosService.criarDesafio()), [aplicar]);

  const entrar = useCallback(
    async (codigo: string) => aplicar(await desafiosService.entrarNoDesafio(codigo.trim().toUpperCase())),
    [aplicar]
  );

  const sair = useCallback(async () => {
    if (!desafio) return;
    const atualizado = await desafiosService.sairDoDesafio(desafio.id);
    // Cancelado some na hora; desistência mostra o resultado (derrota).
    aplicar(atualizado.status === 'FINALIZADO' ? atualizado : null);
  }, [desafio, aplicar]);

  const dispensarResultado = useCallback(() => {
    if (desafio) setDispensado(desafio.id);
  }, [desafio]);

  // Pausa a atualização em segundo plano; ao voltar, atualiza na hora.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (estado) => setEmPrimeiroPlano(estado === 'active'));
    return () => sub.remove();
  }, []);

  const ativo = desafio?.status === 'EM_ANDAMENTO' || desafio?.status === 'AGUARDANDO';

  useEffect(() => {
    if (!usuario) {
      setDesafio(null);
      return;
    }
    if (!emPrimeiroPlano) return;

    atualizar();
    const timer = setInterval(atualizar, ativo ? INTERVALO_ATIVO_MS : INTERVALO_OCIOSO_MS);
    return () => clearInterval(timer);
  }, [usuario?.id, emPrimeiroPlano, ativo, atualizar]);

  // Ao terminar (vitória por tempo, desistência do oponente), o bônus muda a pontuação:
  // busca o valor novo para Início e Perfil ficarem certos.
  const statusAnterior = useRef(desafio?.status);
  useEffect(() => {
    const terminou = statusAnterior.current === 'EM_ANDAMENTO' && desafio?.status === 'FINALIZADO';
    statusAnterior.current = desafio?.status;
    if (terminou && desafio?.resultado === 'vitoria') {
      buscarPontuacao()
        .then((total) => total !== pontuacaoRef.current && atualizarPontuacao(total))
        .catch(() => undefined);
    }
  }, [desafio?.status, desafio?.resultado, atualizarPontuacao]);

  const pendentes = useMemo(() => {
    if (!desafio || desafio.status !== 'EM_ANDAMENTO') return new Set<number>();
    const meus = new Set(desafio.eu.coletados);
    return new Set(desafio.pontos.map((p) => p.id).filter((id) => !meus.has(id)));
  }, [desafio]);

  const visivel = desafio && desafio.id === dispensado && desafio.status === 'FINALIZADO' ? null : desafio;

  return (
    <DesafioContext.Provider
      value={{ desafio: visivel, pendentes, ajusteRelogio, criar, entrar, sair, atualizar, dispensarResultado }}
    >
      {children}
    </DesafioContext.Provider>
  );
}

export function useDesafio(): DesafioContextValue {
  const ctx = useContext(DesafioContext);
  if (!ctx) throw new Error('useDesafio deve ser usado dentro de <DesafioProvider>.');
  return ctx;
}
