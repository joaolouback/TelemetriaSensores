/**
 * Serviço de check-in nos pontos do campus (`/api/interacoes`).
 *
 * O check-in é feito ao tocar no objeto 3D em realidade aumentada. O backend
 * revalida o geofence com a posição enviada e credita os pontos uma única vez.
 */
import { API_URL } from '../constants';
import { LocationData, ResultadoCheckin } from '../types';
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

/**
 * Envia o check-in com a posição atual. A precisão e o aviso de GPS falso
 * (`mocked`, só no Android) vão junto para o backend recusar posições não confiáveis.
 */
export async function registrarCheckin(pontoId: number, posicao: LocationData): Promise<ResultadoCheckin> {
  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}/interacoes`, {
      method: 'POST',
      headers: cabecalhos(),
      body: JSON.stringify({
        pontoId,
        latitude: posicao.latitude,
        longitude: posicao.longitude,
        precisao: posicao.accuracy,
        mockado: posicao.mocked ?? null,
      }),
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

async function buscarMinhas(): Promise<{ pontosColetados: number[]; pontuacaoTotal: number }> {
  const resposta = await fetch(`${API_URL}/interacoes/minhas`, { headers: cabecalhos() });

  if (!resposta.ok) {
    throw new Error(`HTTP ${resposta.status} ao buscar pontos coletados.`);
  }

  const json = await resposta.json();
  return { pontosColetados: json?.pontosColetados ?? [], pontuacaoTotal: json?.pontuacaoTotal ?? 0 };
}

/** Ids dos pontos que o usuário logado já coletou (`GET /api/interacoes/minhas`). */
export async function buscarPontosColetados(): Promise<number[]> {
  return (await buscarMinhas()).pontosColetados;
}

/** Pontuação atual do usuário logado — muda fora do check-in (bônus de desafio). */
export async function buscarPontuacao(): Promise<number> {
  return (await buscarMinhas()).pontuacaoTotal;
}
