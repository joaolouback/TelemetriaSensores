/** Loja de itens (`/api/loja`): catálogo, compra e itens equipados. */
import { API_URL } from '../constants';
import { CategoriaItem, EstadoLoja } from '../types';
import { getToken } from './auth';

/** Erro com mensagem já pronta para exibir ao usuário. */
export class LojaError extends Error {}

async function requisitar(metodo: 'GET' | 'POST' | 'PUT', caminho: string, corpo?: object): Promise<EstadoLoja> {
  const token = getToken();
  if (!token) throw new LojaError('Faça login para usar a loja.');

  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method: metodo,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(corpo ? { 'Content-Type': 'application/json' } : {}),
      },
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new LojaError('Sem conexão com o servidor. Verifique sua internet.');
  }

  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok) throw new LojaError(dados?.error ?? `Erro inesperado (HTTP ${resposta.status}).`);
  return dados as EstadoLoja;
}

export const buscarLoja = () => requisitar('GET', '/loja');

/** Compra e já equipa o item. */
export const comprarItem = (codigo: string) =>
  requisitar('POST', `/loja/itens/${encodeURIComponent(codigo)}/compra`);

/** Equipa um item comprado; `codigo` nulo volta ao padrão da categoria. */
export const equiparItem = (categoria: CategoriaItem, codigo: string | null) =>
  requisitar('PUT', '/loja/equipados', { categoria, codigo });
