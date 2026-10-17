
/** Definições de interfaces e tipos TypeScript utilizados em toda a aplicação */
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
  /** Android: `true` quando a posição vem de um app de GPS falso. */
  mocked?: boolean;
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
  /** Absoluta ou relativa ao servidor (ex.: `/modelos/cristal.glb`). */
  assetUrl: string;
  formato: string | null;
  escala: number;
  pontoDeInteresseId: number;
}

export interface Conquista {
  id: number;
  titulo: string;
  descricao: string | null;
  iconeUrl: string | null;
  pontosNecessarios: number;
}

/** Resposta do check-in (`POST /api/interacoes`) quando o objeto é coletado. */
export interface ResultadoCheckin {
  distanciaMetros: number;
  /** 0 quando o ponto já tinha sido coletado e o toque só contou para o desafio. */
  pontosGanhos: number;
  pontuacaoTotal: number;
  novasConquistas: Conquista[];
  /** Progresso no desafio 1x1, se o ponto faz parte do desafio em andamento. */
  desafio: ColetaDesafio | null;
}

// ─── Desafio 1x1 (`/api/desafios`) ───────────────────────────────────

export type StatusDesafio = 'AGUARDANDO' | 'EM_ANDAMENTO' | 'FINALIZADO' | 'CANCELADO' | 'EXPIRADO';
export type ResultadoDesafio = 'vitoria' | 'derrota' | 'empate';

export interface JogadorDesafio {
  id: number;
  nome: string;
  /** Ids dos pontos do desafio já coletados por este jogador. */
  coletados: number[];
}

/** Desafio visto pelo usuário logado (`eu`). Datas em ISO 8601. */
export interface Desafio {
  id: number;
  codigo: string;
  status: StatusDesafio;
  papel: 'desafiante' | 'desafiado';
  criadoEm: string;
  conviteExpiraEm: string;
  iniciadoEm: string | null;
  terminaEm: string | null;
  finalizadoEm: string | null;
  /** Hora do servidor na resposta — corrige o cronômetro se o relógio do celular estiver errado. */
  agora: string;
  pontos: { id: number; nome: string; latitude: number; longitude: number; raioGeofence: number }[];
  eu: JogadorDesafio;
  oponente: JogadorDesafio | null;
  resultado: ResultadoDesafio | null;
  bonusVitoria: number;
}

export interface ColetaDesafio {
  desafioId: number;
  coletados: number;
  total: number;
  finalizado: boolean;
  resultado: ResultadoDesafio | null;
  bonus: number;
}

export interface PlacarDesafios {
  vitorias: number;
  derrotas: number;
  empates: number;
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
  /** História/curiosidade mostrada no card do local depois da coleta. */
  curiosidade?: string | null;
  /** Foto do local — relativa ao servidor (ex.: `/imagens/biblioteca.jpg`) ou absoluta. */
  imagemUrl?: string | null;
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
