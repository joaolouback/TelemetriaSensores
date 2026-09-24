
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



export const COLORS = {
  primary: '#6C63FF',
  primaryLight: '#A5A0FF',
  primaryDark: '#4B44CC',

  background: '#0F0F1A',
  surface: '#1A1A2E',
  surfaceLight: '#24243E',
  surfaceElevated: '#2E2E4A',


  textPrimary: '#EAEAF0',
  textSecondary: '#9090A7',
  textMuted: '#5E5E78',

  success: '#00D68F',
  warning: '#FFB547',
  danger: '#FF6B6B',
  info: '#4EC5F1',

  gps: '#4EC5F1',
  accelerometer: '#FFB547',
  battery: '#00D68F',
  connectivity: '#6C63FF',
  storage: '#FF6B9D',

  border: '#2A2A44',
  cardShadow: 'rgba(0, 0, 0, 0.3)',
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

/** Dados mock do usuário para a tela inicial */
export const USER_MOCK = {
  nome: 'Arthur',
  iniciais: 'AR',
  nivel: 5,
  titulo: 'Explorador Master',
  xpAtual: 4200,
  xpProximoNivel: 5000,
};

/** Missões diárias mock */
export const MISSOES_MOCK = [
  {
    id: 1,
    titulo: 'Check-in na Biblioteca',
    descricao: 'Explore a área de periódicos.',
    xp: 150,
    concluida: false,
    icone: '📖',
  },
  {
    id: 2,
    titulo: 'Passe pelo Prédio Inova',
    descricao: 'Concluída hoje às 08:30',
    xp: 100,
    concluida: true,
    icone: '✅',
  },
  {
    id: 3,
    titulo: 'Visite o Laboratório Maker',
    descricao: 'Descubra o espaço de criação.',
    xp: 200,
    concluida: false,
    icone: '🔧',
  },
];

/** Locais para a seção Descubra (mock) */
export const DESCUBRA_MOCK = [
  { id: 1, nome: 'Anfiteatro', distancia: '120m daqui', cor: '#3B5BDB' },
  { id: 2, nome: 'Lab Maker', distancia: '300m daqui', cor: '#7C3AED' },
  { id: 3, nome: 'Biblioteca', distancia: '450m daqui', cor: '#059669' },
  { id: 4, nome: 'Quadra', distancia: '600m daqui', cor: '#D97706' },
];


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
import Constants from 'expo-constants';

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

export const API_URL = `http://${API_HOST}:${API_PORT}/api`;
export const WS_URL = `ws://${API_HOST}:${API_PORT}/ws`;

console.log(`[constants] Backend: ${API_URL}`);

