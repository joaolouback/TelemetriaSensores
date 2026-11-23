/**
 * Tema do app (claro, escuro ou o mesmo do sistema), ou um tema comprado na loja.
 *
 * A escolha fica salva no aparelho (SQLite) e vale antes mesmo do login. O tema da loja,
 * quando equipado, tem prioridade sobre a preferência claro/escuro.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { TEMA_CLARO, TEMA_ESCURO, TEMAS_LOJA, Tema } from '../constants/temas';
import { getPreferenciaTema, getTemaLoja, salvarPreferenciaTema, salvarTemaLoja } from '../database/database';

export type PreferenciaTema = 'sistema' | 'claro' | 'escuro';

interface TemaContextValue {
  cores: Tema;
  escuro: boolean;
  /** Cor dos ícones da barra de status (clara sobre fundo escuro e vice-versa). */
  barraStatus: 'light-content' | 'dark-content';
  preferencia: PreferenciaTema;
  definirPreferencia: (preferencia: PreferenciaTema) => void;
  /** Código do tema da loja em uso (null = claro/escuro/sistema). */
  temaLoja: string | null;
  definirTemaLoja: (codigo: string | null) => void;
}

export const TemaContext = createContext<TemaContextValue>({
  cores: TEMA_CLARO,
  escuro: false,
  barraStatus: 'dark-content',
  preferencia: 'sistema',
  definirPreferencia: () => undefined,
  temaLoja: null,
  definirTemaLoja: () => undefined,
});

export function TemaProvider({ children }: { children: React.ReactNode }) {
  const sistema = useColorScheme();
  const [preferencia, setPreferencia] = useState<PreferenciaTema>('sistema');
  const [temaLoja, setTemaLoja] = useState<string | null>(null);

  useEffect(() => {
    getPreferenciaTema()
      .then(setPreferencia)
      .catch((e) => console.warn('[Tema] Erro ao ler a preferência:', e));
    getTemaLoja()
      .then(setTemaLoja)
      .catch((e) => console.warn('[Tema] Erro ao ler o tema da loja:', e));
  }, []);

  const definirTemaLoja = useCallback((codigo: string | null) => {
    setTemaLoja(codigo);
    salvarTemaLoja(codigo).catch((e) => console.warn('[Tema] Erro ao salvar o tema da loja:', e));
  }, []);

  const definirPreferencia = useCallback((nova: PreferenciaTema) => {
    setPreferencia(nova);
    salvarPreferenciaTema(nova).catch((e) => console.warn('[Tema] Erro ao salvar a preferência:', e));
  }, []);

  const daLoja = temaLoja ? TEMAS_LOJA[temaLoja] : undefined;
  const escuro = daLoja
    ? daLoja.escuro
    : preferencia === 'sistema'
      ? sistema === 'dark'
      : preferencia === 'escuro';

  const valor = useMemo<TemaContextValue>(
    () => ({
      cores: daLoja?.cores ?? (escuro ? TEMA_ESCURO : TEMA_CLARO),
      escuro,
      barraStatus: escuro ? 'light-content' : 'dark-content',
      preferencia,
      definirPreferencia,
      temaLoja: daLoja ? temaLoja : null,
      definirTemaLoja,
    }),
    [daLoja, escuro, preferencia, definirPreferencia, temaLoja, definirTemaLoja]
  );

  return <TemaContext.Provider value={valor}>{children}</TemaContext.Provider>;
}

export const useTema = () => useContext(TemaContext);

/** Cria os estilos da tela para o tema atual (recalcula só quando o tema muda). */
export function useEstilos<T>(criar: (cores: Tema) => T): T {
  const { cores } = useTema();
  return useMemo(() => criar(cores), [criar, cores]);
}
