/** Serviço de consulta dos pontos de interesse do campus na API do UVV Go. */
import { API_URL } from '../constants';
import { PontoDeInteresse } from '../types';

/**
 * Busca os pontos de coleta ativos (`GET /api/pontos`).
 * Lança erro em caso de falha para que a tela possa exibir o estado de erro.
 */
export async function buscarPontos(): Promise<PontoDeInteresse[]> {
  const resposta = await fetch(`${API_URL}/pontos`);

  if (!resposta.ok) {
    throw new Error(`HTTP ${resposta.status} ao buscar pontos de interesse.`);
  }

  const json = await resposta.json();
  return (json?.data ?? []) as PontoDeInteresse[];
}
