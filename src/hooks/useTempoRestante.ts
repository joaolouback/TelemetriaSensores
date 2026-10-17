/**
 * Cronômetro regressivo até `fim` (ISO 8601), atualizado a cada segundo.
 *
 * `ajusteRelogio` é a diferença entre o relógio do servidor e o do celular:
 * assim o tempo mostrado é o mesmo para os dois jogadores, mesmo que um
 * celular esteja com a hora errada.
 */
import { useEffect, useState } from 'react';

export function useTempoRestante(fim: string | null | undefined, ajusteRelogio: number) {
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    if (!fim) return;
    const timer = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [fim]);

  if (!fim) return { restanteMs: 0, texto: '--:--' };

  const restanteMs = Math.max(0, new Date(fim).getTime() - (agora + ajusteRelogio));
  const totalSeg = Math.floor(restanteMs / 1000);
  const min = String(Math.floor(totalSeg / 60)).padStart(2, '0');
  const seg = String(totalSeg % 60).padStart(2, '0');
  return { restanteMs, texto: `${min}:${seg}` };
}
