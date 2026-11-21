/**
 * Tema do app (claro, escuro ou o mesmo do sistema).
 *
 * A escolha fica salva no aparelho (SQLite) e vale antes mesmo do login.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { TEMA_CLARO, TEMA_ESCURO, Tema } from '../constants/temas';
import { getPreferenciaTema, salvarPreferenciaTema } from '../database/database';

export type PreferenciaTema = 'sistema' | 'claro' | 'escuro';

interface TemaContextValue {
  cores: Tema;
  escuro: boolean;
  /** Cor dos ícones da barra de status (clara sobre fundo escuro e vice-versa). */
  barraStatus: 'light-content' | 'dark-content';
  preferencia: PreferenciaTema;
  definirPreferencia: (preferencia: PreferenciaTema) => void;
}

export const TemaContext = createContext<TemaContextValue>({
  cores: TEMA_CLARO,
  escuro: false,
  barraStatus: 'dark-content',
  preferencia: 'sistema',
  definirPreferencia: () => undefined,
});

export function TemaProvider({ children }: { children: React.ReactNode }) {
  const sistema = useColorScheme();
  const [preferencia, setPreferencia] = useState<PreferenciaTema>('sistema');

  useEffect(() => {
    getPreferenciaTema()
      .then(setPreferencia)
      .catch((e) => console.warn('[Tema] Erro ao ler a preferência:', e));
  }, []);

  const definirPreferencia = useCallback((nova: PreferenciaTema) => {
    setPreferencia(nova);
    salvarPreferenciaTema(nova).catch((e) => console.warn('[Tema] Erro ao salvar a preferência:', e));
  }, []);

  const escuro = preferencia === 'sistema' ? sistema === 'dark' : preferencia === 'escuro';

  const valor = useMemo<TemaContextValue>(
    () => ({
      cores: escuro ? TEMA_ESCURO : TEMA_CLARO,
      escuro,
      barraStatus: escuro ? 'light-content' : 'dark-content',
      preferencia,
      definirPreferencia,
    }),
    [escuro, preferencia, definirPreferencia]
  );

  return <TemaContext.Provider value={valor}>{children}</TemaContext.Provider>;
}

export const useTema = () => useContext(TemaContext);

/** Cria os estilos da tela para o tema atual (recalcula só quando o tema muda). */
export function useEstilos<T>(criar: (cores: Tema) => T): T {
  const { cores } = useTema();
  return useMemo(() => criar(cores), [criar, cores]);
}
