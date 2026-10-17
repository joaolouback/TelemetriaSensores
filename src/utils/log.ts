/**
 * Log de depuração: aparece no terminal do Metro durante o desenvolvimento e
 * some no build final (`__DEV__` é false), onde só avisos e erros importam.
 * Para avisos e erros continue usando `console.warn` / `console.error`.
 */
export const logDebug = (...args: unknown[]): void => {
  if (__DEV__) console.log(...args);
};
