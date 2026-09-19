
/** Definições de interfaces e tipos TypeScript utilizados em toda a aplicação */
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
  level: number; // 0 a 1
  isCharging: boolean;
}

export interface ConnectivityData {
  type: 'wifi' | 'cellular' | 'none' | 'unknown';
  isConnected: boolean;
}


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
  synced: number;
  created_at: string;
}


export enum CollectionStatus {
  IDLE = 'idle',
  COLLECTING = 'collecting',
  STOPPED = 'stopped',
}

export interface StorageInfo {
  recordCount: number;
  lastRecord: SensorLog | null;
}



export interface SensorState {
  location: LocationData | null;
  accelerometer: AccelerometerData | null;
  battery: BatteryData | null;
  connectivity: ConnectivityData;
}

/** Modelo 3D associado a um ponto (renderizado via ARCore). */
export interface Objeto3D {
  id: number;
  nome: string;
  assetUrl: string;
  formato: string;
  escala: number;
  pontoId: number;
}

/** Ponto de coleta do campus, vindo da API (`GET /api/pontos`). */
export interface PontoDeInteresse {
  id: number;
  nome: string;
  descricao: string | null;
  latitude: number;
  longitude: number;
  raioGeofence: number;
  pontosRecompensa: number;
  ativo: boolean;
  objeto3d?: Objeto3D | null;
}

/** Ponto enriquecido com a distância até o usuário, calculada localmente. */
export interface PontoComDistancia extends PontoDeInteresse {
  distanciaMetros: number;
  dentroDoRaio: boolean;
}

/** Uma posição do trajeto percorrido, usada para desenhar a rota no mapa. */
export interface PontoTrajeto {
  latitude: number;
  longitude: number;
}
