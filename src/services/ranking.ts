/** Ranking de jogadores e conquistas do usuário (`/api/ranking`, `/api/conquistas`). */
import { API_URL } from '../constants';
import { ConquistaDoUsuario, PerfilJogador, Ranking } from '../types';
import { getToken } from './auth';

/** Erro com mensagem já pronta para exibir ao usuário. */
export class RankingError extends Error {}

async function buscar<T>(caminho: string): Promise<T> {
  const token = getToken();
  if (!token) throw new RankingError('Faça login para ver esta informação.');

  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, { headers: { Authorization: `Bearer ${token}` } });
  } catch {
    throw new RankingError('Sem conexão com o servidor. Verifique sua internet.');
  }

  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok) throw new RankingError(dados?.error ?? `Erro inesperado (HTTP ${resposta.status}).`);
  return dados as T;
}

export const buscarRanking = () => buscar<Ranking>('/ranking');

export const buscarConquistas = async (): Promise<ConquistaDoUsuario[]> =>
  (await buscar<{ data: ConquistaDoUsuario[] }>('/conquistas')).data;

export const buscarPerfilJogador = (id: number) => buscar<PerfilJogador>(`/jogadores/${id}`);
