// ========================
// Sensor Data Types
// ========================

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
}

export interface AccelerometerData {
  x: number;
  y: number;
  z: number;
  magnitude: number;
}

export interface BatteryData {
  level: number; // 0 to 1
  isCharging: boolean;
}

export interface ConnectivityData {
  type: 'wifi' | 'cellular' | 'none' | 'unknown';
  isConnected: boolean;
}

// ========================
// SQLite Record
// ========================

export interface SensorLog {
  id?: number;
  sensor_type: string;
  latitude: number | null;
  longitude: number | null;
  accel_x: number | null;
  accel_y: number | null;
  accel_z: number | null;
  magnitude: number | null;
  battery_level: number | null;
  network_type: string | null;
  synced: number; // 0 = not synced, 1 = synced
  created_at: string;
}

// ========================
// App State
// ========================

export enum CollectionStatus {
  IDLE = 'idle',
  COLLECTING = 'collecting',
  STOPPED = 'stopped',
}

export interface StorageInfo {
  recordCount: number;
  lastRecord: SensorLog | null;
}

// ========================
// Sensor State (aggregated)
// ========================

export interface SensorState {
  location: LocationData | null;
  accelerometer: AccelerometerData | null;
  battery: BatteryData | null;
  connectivity: ConnectivityData;
}
