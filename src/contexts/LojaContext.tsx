/**
 * Estado da loja de itens: saldo, itens comprados e equipados.
 *
 * Recarrega quando o jogador entra ou a pontuação muda (uma coleta aumenta o saldo).
 * O tema equipado é repassado ao TemaContext, que o guarda no aparelho.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { useTema } from './TemaContext';
import { buscarLoja, comprarItem, equiparItem } from '../services/loja';
import { CategoriaItem, EstadoLoja, MolduraVisual } from '../types';

interface LojaContextValue {
  loja: EstadoLoja | null;
  erro: string | null;
  recarregar: () => Promise<void>;
  /** Compra e equipa o item. Lança `LojaError` com a mensagem para o jogador. */
  comprar: (codigo: string) => Promise<void>;
  equipar: (categoria: CategoriaItem, codigo: string | null) => Promise<void>;
  /** Itens equipados, prontos para desenhar. */
  moldura: MolduraVisual | null;
  titulo: string | null;
  corRastro: string | null;
}

const LojaContext = createContext<LojaContextValue | null>(null);

export function LojaProvider({ children }: { children: React.ReactNode }) {
  const { usuario, atualizarPontuacao } = useAuth();
  const pontuacaoSessao = useRef(usuario?.pontuacaoTotal);
  pontuacaoSessao.current = usuario?.pontuacaoTotal;
  const { definirTemaLoja } = useTema();
  const [loja, setLoja] = useState<EstadoLoja | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const aplicar = useCallback(
    (nova: EstadoLoja) => {
      setLoja(nova);
      setErro(null);
      definirTemaLoja(nova.equipados.TEMA);
      // A loja vem do servidor: se a pontuação mudou lá, Início e Perfil passam a mostrar a nova.
      if (pontuacaoSessao.current !== undefined && nova.pontuacaoTotal !== pontuacaoSessao.current) {
        atualizarPontuacao(nova.pontuacaoTotal);
      }
    },
    [definirTemaLoja, atualizarPontuacao]
  );

  const recarregar = useCallback(async () => {
    try {
      aplicar(await buscarLoja());
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível carregar a loja.');
    }
  }, [aplicar]);

  useEffect(() => {
    if (usuario?.id) recarregar();
  }, [usuario?.id, usuario?.pontuacaoTotal, recarregar]);

  // Ao sair da conta, o próximo jogador não herda o tema comprado por este.
  useEffect(() => () => definirTemaLoja(null), [definirTemaLoja]);

  const comprar = useCallback(async (codigo: string) => aplicar(await comprarItem(codigo)), [aplicar]);
  const equipar = useCallback(
    async (categoria: CategoriaItem, codigo: string | null) => aplicar(await equiparItem(categoria, codigo)),
    [aplicar]
  );

  const valor = useMemo<LojaContextValue>(() => {
    const equipado = (categoria: CategoriaItem) =>
      loja?.itens.find((i) => i.categoria === categoria && i.equipado) ?? null;
    const moldura = equipado('MOLDURA');
    return {
      loja,
      erro,
      recarregar,
      comprar,
      equipar,
      moldura: moldura ? { codigo: moldura.codigo, ...moldura.visual } : null,
      titulo: equipado('TITULO')?.visual.texto ?? null,
      corRastro: equipado('RASTRO')?.visual.cores?.[0] ?? null,
    };
  }, [loja, erro, recarregar, comprar, equipar]);

  return <LojaContext.Provider value={valor}>{children}</LojaContext.Provider>;
}

export function useLoja(): LojaContextValue {
  const ctx = useContext(LojaContext);
  if (!ctx) throw new Error('useLoja deve ser usado dentro de <LojaProvider>.');
  return ctx;
}
