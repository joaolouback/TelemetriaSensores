
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


/**
 * Registro da tabela local `telemetria_sensor` (SQLite).
 * Segue a classe TelemetriaSensor do diagrama de classes; `usuario_id` vem da
 * associação Usuario 1 —gera→ * TelemetriaSensor e `synced` é controle local de sincronização.
 */
export interface SensorLog {
  id?: number;
  usuario_id: number | null;
  latitude: number;
  longitude: number;
  acelerometro_x: number | null;
  acelerometro_y: number | null;
  acelerometro_z: number | null;
  magnitude: number | null;
  /** 0 a 100 (%) */
  nivel_bateria: number | null;
  tipo_rede: string | null;
  /** ISO 8601 */
  timestamp: string;
  synced: number;
}

/** Usuário autenticado, como devolvido pela API (`/api/auth/*`). */
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  pontuacaoTotal: number;
  dataCadastro: string;
}

export interface Sessao {
  token: string;
  usuario: Usuario;
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
