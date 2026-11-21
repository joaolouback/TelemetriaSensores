/**
 * Navegação entre abas a partir de outras telas (ex.: "Ver no mapa" no detalhe de um local).
 * A barra de abas é quem guarda a aba atual e fornece este contexto.
 */
import { createContext, useContext } from 'react';

export interface PontoEmFoco {
  id: number;
  /** Muda a cada pedido, para focar de novo o mesmo ponto. */
  pedido: number;
}

interface NavegacaoContextValue {
  /** Abre o mapa e centraliza no ponto. */
  irParaPonto: (pontoId: number) => void;
  pontoEmFoco: PontoEmFoco | null;
}

export const NavegacaoContext = createContext<NavegacaoContextValue>({
  irParaPonto: () => undefined,
  pontoEmFoco: null,
});

export const useNavegacao = () => useContext(NavegacaoContext);
