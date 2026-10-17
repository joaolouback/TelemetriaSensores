import { SERVER_URL } from '../constants';

/**
 * Arquivos servidos pela API (modelos 3D, fotos dos locais) vêm com caminho relativo,
 * ex.: `/modelos/cristal.glb`. Completa com o endereço do servidor; URLs absolutas passam direto.
 */
export function urlDoServidor(caminho: string): string {
  if (/^https?:\/\//.test(caminho)) return caminho;
  return `${SERVER_URL}${caminho.startsWith('/') ? '' : '/'}${caminho}`;
}
