/**
 * Serviço de autenticação: chamadas à API e sessão em memória.
 *
 * A sessão fica num módulo (e não só no React) porque a sincronização de telemetria
 * roda fora dos componentes e precisa do token e do id do usuário atual.
 */
import { API_URL } from '../constants';
import { Sessao } from '../types';

let sessaoAtual: Sessao | null = null;

export function definirSessaoAtual(sessao: Sessao | null): void {
  sessaoAtual = sessao;
}

export function getToken(): string | null {
  return sessaoAtual?.token ?? null;
}

export function getUsuarioId(): number | null {
  return sessaoAtual?.usuario.id ?? null;
}

/** Erro com mensagem já pronta para exibir ao usuário. */
export class AuthError extends Error {}

async function postAuth(caminho: string, corpo: object): Promise<Sessao> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/auth/${caminho}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
    });
  } catch {
    throw new AuthError('Sem conexão com o servidor. Verifique sua internet e tente novamente.');
  }

  const dados = await response.json().catch(() => null);

  if (!response.ok) {
    throw new AuthError(dados?.error ?? `Erro inesperado (HTTP ${response.status}).`);
  }

  return dados as Sessao;
}

export function login(email: string, senha: string): Promise<Sessao> {
  return postAuth('login', { email, senha });
}

export function registrar(nome: string, email: string, senha: string): Promise<Sessao> {
  return postAuth('registro', { nome, email, senha });
}
