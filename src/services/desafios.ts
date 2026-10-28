/**
 * Serviço do desafio 1x1 (`/api/desafios`).
 *
 * Um jogador cria o desafio e manda o código para o amigo; quando o amigo entra,
 * a partida de 1 hora começa. Vence quem coletar primeiro os 3 pontos sorteados.
 */
import { API_URL } from '../constants';
import { Desafio, PlacarDesafios } from '../types';
import { getToken } from './auth';

/** Erro com mensagem já pronta para exibir ao usuário. */
export class DesafioError extends Error {}

async function requisitar<T>(metodo: 'GET' | 'POST', caminho: string, corpo?: object): Promise<T> {
  const token = getToken();
  if (!token) throw new DesafioError('Faça login para desafiar outros jogadores.');

  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method: metodo,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new DesafioError('Sem conexão com o servidor. Verifique sua internet.');
  }

  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    throw new DesafioError(dados?.error ?? `Erro inesperado (HTTP ${resposta.status}).`);
  }
  return dados as T;
}

export const criarDesafio = () => requisitar<Desafio>('POST', '/desafios');

export const entrarNoDesafio = (codigo: string) =>
  requisitar<Desafio>('POST', '/desafios/entrar', { codigo });

/** O desafio ativo, ou o que terminou há pouco (para mostrar o resultado). */
export const buscarDesafioAtual = async (): Promise<Desafio | null> =>
  (await requisitar<{ desafio: Desafio | null }>('GET', '/desafios/atual')).desafio;

/** Cancela (antes de começar) ou desiste (durante — o oponente vence). */
export const sairDoDesafio = (id: number) => requisitar<Desafio>('POST', `/desafios/${id}/sair`);

export const buscarPlacarDesafios = () =>
  requisitar<PlacarDesafios & { desafios: Desafio[] }>('GET', '/desafios/historico');
