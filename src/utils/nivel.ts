/**
 * Nível do jogador calculado a partir da pontuação real (`usuario.pontuacaoTotal`).
 *
 * Os 10 pontos do campus somam 145 pontos; com 30 por nível, quem coleta tudo
 * chega ao nível 5 ("Lenda do Campus").
 */
export const PONTOS_POR_NIVEL = 30;

const TITULOS = ['Calouro', 'Explorador', 'Desbravador', 'Veterano', 'Lenda do Campus'];

export interface Nivel {
  nivel: number;
  titulo: string;
  /** Pontos acumulados dentro do nível atual. */
  pontosNoNivel: number;
  /** Quanto falta para o próximo nível. */
  faltam: number;
  /** 0 a 1, para a barra de progresso. */
  progresso: number;
}

export function calcularNivel(pontuacaoTotal: number): Nivel {
  const pontos = Math.max(0, pontuacaoTotal);
  const nivel = Math.floor(pontos / PONTOS_POR_NIVEL) + 1;
  const pontosNoNivel = pontos % PONTOS_POR_NIVEL;

  return {
    nivel,
    titulo: TITULOS[Math.min(nivel, TITULOS.length) - 1],
    pontosNoNivel,
    faltam: PONTOS_POR_NIVEL - pontosNoNivel,
    progresso: pontosNoNivel / PONTOS_POR_NIVEL,
  };
}
