import Constants from 'expo-constants';
import { logDebug } from '../utils/log';

/** Constantes globais do sistema, incluindo cores, intervalos e URLs da API */
export const GPS_INTERVAL_MS = 30_000;
export const ACCELEROMETER_INTERVAL_MS = 1_000;
export const BATTERY_INTERVAL_MS = 30_000;
export const SAVE_INTERVAL_MS = 30_000;

/**
 * Rastreamento do mapa em tempo real.
 * Bem mais frequente que GPS_INTERVAL_MS (usado na coleta de telemetria),
 * porque aqui o objetivo é ver o marcador andando de forma fluida na tela.
 */
export const MAP_LOCATION_INTERVAL_MS = 1_000;
/** Distância mínima (m) que o usuário precisa andar para gerar nova leitura. */
export const MAP_DISTANCE_INTERVAL_M = 2;
/** Zoom inicial do mapa (quanto menor o delta, mais perto). */
export const MAP_DEFAULT_DELTA = 0.004;
/** Máximo de posições guardadas para desenhar o trajeto percorrido. */
export const MAX_PONTOS_TRAJETO = 500;

/** Centro aproximado do campus da UVV — usado enquanto o GPS não responde. */
export const CAMPUS_UVV = {
  latitude: -20.3417,
  longitude: -40.2917,
};


export const DATABASE_NAME = 'sensor_telemetry.db';
/** Tabela de coleta — mesmo nome e colunas da tabela do backend (diagrama de classes). */
export const TABLE_NAME = 'telemetria_sensor';
/** Tabela da versão anterior do app; migrada para TABLE_NAME na inicialização. */
export const LEGACY_TABLE_NAME = 'sensor_logs';
/** Tabela chave/valor para guardar a sessão do usuário (token + dados). */
export const SESSION_TABLE_NAME = 'sessao';



/**
 * Cores da aba Sensores (painel de telemetria). Tema claro, igual ao resto do app
 * (`HOME_COLORS`); as cores de cada sensor são mais escuras para contrastar com o branco.
 */
export const COLORS = {
  primary: '#3B5BDB',
  primaryLight: '#EEF2FF',
  primaryDark: '#1B2B5E',

  background: '#F5F6FA',
  surface: '#FFFFFF',
  surfaceLight: '#F9FAFB',
  surfaceElevated: '#E5E7EB',

  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',

  success: '#059669',
  warning: '#D97706',
  danger: '#DC2626',
  info: '#0284C7',

  gps: '#0284C7',
  accelerometer: '#D97706',
  battery: '#059669',
  connectivity: '#7C3AED',
  storage: '#DB2777',

  border: '#E8EAF0',
  cardShadow: 'rgba(0, 0, 0, 0.06)',
} as const;

/** Cores do tema claro para a HomeScreen gamificada */
export const HOME_COLORS = {
  background: '#F5F6FA',
  card: '#FFFFFF',
  cardBorder: '#E8EAF0',

  accent: '#1B2B5E',
  accentLight: '#2A3F7E',
  accentGradientStart: '#1B2B5E',
  accentGradientEnd: '#2A4FA0',

  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',

  xpGold: '#F5A623',
  xpBarBg: 'rgba(255, 255, 255, 0.25)',

  success: '#10B981',
  successBg: '#ECFDF5',
  successText: '#059669',

  missionIcon: '#3B5BDB',
  missionIconBg: '#EEF2FF',

  discoverBlue: '#3B5BDB',
  discoverPurple: '#7C3AED',

  tabActive: '#3B5BDB',
  tabInactive: '#9CA3AF',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E5E7EB',
} as const;


export const SENSOR_TYPES = {
  COMBINED: 'combined',
  GPS: 'gps',
  ACCELEROMETER: 'accelerometer',
  BATTERY: 'battery',
  CONNECTIVITY: 'connectivity',
} as const;

/**
 * Endereço do backend.
 *
 * Descoberto automaticamente: o Expo já sabe o IP da máquina que está rodando
 * o Metro (é o mesmo IP do QR code), e o backend roda nessa mesma máquina.
 * Assim o projeto funciona em qualquer computador e qualquer rede, sem ninguém
 * precisar editar código.
 *
 * Para apontar para outro servidor, crie um arquivo `.env` na raiz do app:
 *   EXPO_PUBLIC_API_HOST=192.168.0.42
 *   EXPO_PUBLIC_API_PORT=3000
 */

export const API_PORT = process.env.EXPO_PUBLIC_API_PORT ?? '3000';

function descobrirHost(): string {
  // Override manual tem prioridade.
  const manual = process.env.EXPO_PUBLIC_API_HOST;
  if (manual) return manual;

  // `hostUri` vem no formato "192.168.1.8:8081".
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as any).expoGoConfig?.debuggerHost ??
    '';

  const host = String(hostUri).split(':')[0];

  if (host) return host;

  // Sem Metro (build standalone), não há como adivinhar: exige o .env.
  console.warn(
    '[constants] Não foi possível descobrir o IP do servidor. ' +
      'Defina EXPO_PUBLIC_API_HOST no arquivo .env do app.'
  );
  return 'localhost';
}

export const API_HOST = descobrirHost();

/** Raiz do servidor — usada para arquivos estáticos, como os modelos 3D (`/modelos/*.glb`). */
export const SERVER_URL = `http://${API_HOST}:${API_PORT}`;
export const API_URL = `${SERVER_URL}/api`;
export const WS_URL = `ws://${API_HOST}:${API_PORT}/ws`;

logDebug(`[constants] Backend: ${API_URL}`);

