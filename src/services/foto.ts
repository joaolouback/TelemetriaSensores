/** Foto de perfil do usuário (`PUT/DELETE /api/usuarios/me/foto`). */
import { API_URL } from '../constants';
import { Usuario } from '../types';
import { getToken } from './auth';

/** Erro com mensagem já pronta para exibir ao usuário. */
export class FotoError extends Error {}

async function requisitar(metodo: 'PUT' | 'DELETE', corpo?: Blob, tipo?: string): Promise<Usuario> {
  const token = getToken();
  if (!token) throw new FotoError('Faça login para alterar a foto.');

  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}/usuarios/me/foto`, {
      method: metodo,
      headers: { Authorization: `Bearer ${token}`, ...(tipo ? { 'Content-Type': tipo } : {}) },
      body: corpo,
    });
  } catch {
    throw new FotoError('Sem conexão com o servidor. Verifique sua internet.');
  }

  const dados = await resposta.json().catch(() => null);
  if (resposta.status === 413) throw new FotoError('A foto é grande demais (máximo de 5 MB).');
  if (!resposta.ok) throw new FotoError(dados?.error ?? `Erro inesperado (HTTP ${resposta.status}).`);
  return dados as Usuario;
}

/** Envia a imagem escolhida (arquivo local) e devolve o usuário já com a nova `fotoUrl`. */
export async function enviarFotoPerfil(uri: string, mimeType: string | undefined): Promise<Usuario> {
  const arquivo = await (await fetch(uri)).blob();
  return requisitar('PUT', arquivo, mimeType ?? 'image/jpeg');
}

export const removerFotoPerfil = () => requisitar('DELETE');
