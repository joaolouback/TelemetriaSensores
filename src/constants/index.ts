
/** Constantes globais do sistema, incluindo cores, intervalos e URLs da API */
export const GPS_INTERVAL_MS = 30_000;
export const ACCELEROMETER_INTERVAL_MS = 1_000;
export const BATTERY_INTERVAL_MS = 30_000;
export const SAVE_INTERVAL_MS = 30_000;


export const DATABASE_NAME = 'sensor_telemetry.db';
export const TABLE_NAME = 'sensor_logs';



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


export const SENSOR_TYPES = {
  COMBINED: 'combined',
  GPS: 'gps',
  ACCELEROMETER: 'accelerometer',
  BATTERY: 'battery',
  CONNECTIVITY: 'connectivity',
} as const;

export const API_URL = 'http://192.168.100.59:3000/api';
export const WS_URL = 'ws://192.168.100.59:3000/ws';


// IP atual
// export const API_URL = 'http://[IP_ADDRESS]/api';
// export const WS_URL = 'ws://[IP_ADDRESS]/ws';

