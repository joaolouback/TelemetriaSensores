// ========================
// Sensor Intervals (ms)
// ========================

export const GPS_INTERVAL_MS = 30_000; // 30 seconds
export const ACCELEROMETER_INTERVAL_MS = 1_000; // 1 second
export const BATTERY_INTERVAL_MS = 30_000; // 30 seconds
export const SAVE_INTERVAL_MS = 30_000; // 30 seconds

// ========================
// Database
// ========================

export const DATABASE_NAME = 'sensor_telemetry.db';
export const TABLE_NAME = 'sensor_logs';

// ========================
// Colors (Modern palette)
// ========================

export const COLORS = {
  // Primary
  primary: '#6C63FF',
  primaryLight: '#A5A0FF',
  primaryDark: '#4B44CC',

  // Background
  background: '#0F0F1A',
  surface: '#1A1A2E',
  surfaceLight: '#24243E',
  surfaceElevated: '#2E2E4A',

  // Text
  textPrimary: '#EAEAF0',
  textSecondary: '#9090A7',
  textMuted: '#5E5E78',

  // Status
  success: '#00D68F',
  warning: '#FFB547',
  danger: '#FF6B6B',
  info: '#4EC5F1',

  // Sensor-specific
  gps: '#4EC5F1',
  accelerometer: '#FFB547',
  battery: '#00D68F',
  connectivity: '#6C63FF',
  storage: '#FF6B9D',

  // Misc
  border: '#2A2A44',
  cardShadow: 'rgba(0, 0, 0, 0.3)',
} as const;

// ========================
// Sensor type labels
// ========================

export const SENSOR_TYPES = {
  COMBINED: 'combined',
  GPS: 'gps',
  ACCELEROMETER: 'accelerometer',
  BATTERY: 'battery',
  CONNECTIVITY: 'connectivity',
} as const;
