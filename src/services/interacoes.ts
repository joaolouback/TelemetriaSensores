/**
 * Serviço de check-in nos pontos do campus (`/api/interacoes`).
 *
 * O check-in é feito ao tocar no objeto 3D em realidade aumentada. O backend
 * revalida o geofence com a posição enviada e credita os pontos uma única vez.
 */
import { API_URL } from '../constants';
import { ResultadoCheckin } from '../types';
import { getToken } from './auth';

/** Erro com mensagem já pronta para exibir ao usuário. */
export class CheckinError extends Error {
  /** true quando o ponto já tinha sido coletado antes (HTTP 409). */
  jaColetado: boolean;

  constructor(mensagem: string, jaColetado = false) {
    super(mensagem);
    this.jaColetado = jaColetado;
  }
}

function cabecalhos(): Record<string, string> {
  const token = getToken();
  if (!token) throw new CheckinError('Faça login para coletar os objetos do campus.');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

export async function registrarCheckin(
  pontoId: number,
  latitude: number,
  longitude: number
): Promise<ResultadoCheckin> {
  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}/interacoes`, {
      method: 'POST',
      headers: cabecalhos(),
      body: JSON.stringify({ pontoId, latitude, longitude }),
    });
  } catch {
    throw new CheckinError('Sem conexão com o servidor. Verifique sua internet e toque de novo.');
  }

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    throw new CheckinError(
      dados?.error ?? `Erro inesperado (HTTP ${resposta.status}).`,
      resposta.status === 409
    );
  }

  return dados as ResultadoCheckin;
}

/** Ids dos pontos que o usuário logado já coletou (`GET /api/interacoes/minhas`). */
export async function buscarPontosColetados(): Promise<number[]> {
  const resposta = await fetch(`${API_URL}/interacoes/minhas`, { headers: cabecalhos() });

  if (!resposta.ok) {
    throw new Error(`HTTP ${resposta.status} ao buscar pontos coletados.`);
  }

  const json = await resposta.json();
  return (json?.pontosColetados ?? []) as number[];
}
