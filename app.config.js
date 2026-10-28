/**
 * Configuração dinâmica do Expo: parte do `app.json` e injeta valores secretos.
 *
 * A chave do Google Maps não fica no Git. Ela vem da variável GOOGLE_MAPS_API_KEY:
 * - build na nuvem (EAS): variável cadastrada com `eas env:create` (veja o SETUP.md);
 * - build local (`npm run android`): linha GOOGLE_MAPS_API_KEY=... no arquivo `.env`.
 */
module.exports = ({ config }) => {
  const chaveMaps = process.env.GOOGLE_MAPS_API_KEY;

  if (!chaveMaps) {
    console.warn(
      '[app.config] GOOGLE_MAPS_API_KEY não definida — o mapa vai abrir cinza no app instalado.'
    );
  }

  return {
    ...config,
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: { apiKey: chaveMaps ?? '' },
      },
    },
  };
};
