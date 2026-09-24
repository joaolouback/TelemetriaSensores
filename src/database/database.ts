/** Gerenciamento do banco de dados SQLite local e persistência de logs */
import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME, TABLE_NAME, LEGACY_TABLE_NAME, SESSION_TABLE_NAME } from '../constants';
import { SensorLog, Sessao } from '../types';

let db: SQLite.SQLiteDatabase | null = null;
// Guarda a inicialização em andamento: AuthProvider e TelemetriaProvider chamam
// initDatabase() ao mesmo tempo na abertura do app, e só pode haver uma conexão.
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;


export function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return Promise.resolve(db);
  if (!initPromise) {
    initPromise = openAndMigrate().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}


async function openAndMigrate(): Promise<SQLite.SQLiteDatabase> {
  const database = await SQLite.openDatabaseAsync(DATABASE_NAME);

  // Colunas iguais às da classe TelemetriaSensor do diagrama (snake_case, como no Postgres).
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      acelerometro_x REAL,
      acelerometro_y REAL,
      acelerometro_z REAL,
      magnitude REAL,
      nivel_bateria INTEGER,
      tipo_rede TEXT,
      timestamp TEXT NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_${TABLE_NAME}_synced ON ${TABLE_NAME} (synced, id);
    CREATE TABLE IF NOT EXISTS ${SESSION_TABLE_NAME} (
      chave TEXT PRIMARY KEY NOT NULL,
      valor TEXT NOT NULL
    );
  `);

  await migrarTabelaLegada(database);

  db = database;
  return database;
}


/**
 * Copia os registros da tabela antiga (`sensor_logs`) para o novo formato e a remove.
 * Registros sem GPS são descartados: sem coordenadas não servem para geolocalização.
 */
async function migrarTabelaLegada(database: SQLite.SQLiteDatabase): Promise<void> {
  const legado = await database.getFirstAsync<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
    [LEGACY_TABLE_NAME]
  );
  if (!legado) return;

  await database.withTransactionAsync(async () => {
    await database.execAsync(`
      INSERT INTO ${TABLE_NAME}
        (latitude, longitude, acelerometro_x, acelerometro_y, acelerometro_z, magnitude,
         nivel_bateria, tipo_rede, timestamp, synced)
      SELECT
        latitude, longitude, accel_x, accel_y, accel_z, magnitude,
        CASE WHEN battery_level IS NULL THEN NULL
             WHEN battery_level <= 1 THEN CAST(ROUND(battery_level * 100) AS INTEGER)
             ELSE CAST(ROUND(battery_level) AS INTEGER) END,
        network_type, created_at, synced
      FROM ${LEGACY_TABLE_NAME}
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
      DROP TABLE ${LEGACY_TABLE_NAME};
    `);
  });

  console.log(`[DB] Tabela ${LEGACY_TABLE_NAME} migrada para ${TABLE_NAME}.`);
}


export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}


export async function insertSensorLog(log: Omit<SensorLog, 'id'>): Promise<number> {
  const database = getDatabase();

  // Helper para sanitizar `NaN` ou `undefined`, que causam NullPointerException no Java (Expo SQLite)
  const sanitize = (val: number | null | undefined): number | null => {
    if (val === null || val === undefined || Number.isNaN(val)) return null;
    return val;
  };

  const result = await database.runAsync(
    `INSERT INTO ${TABLE_NAME}
     (usuario_id, latitude, longitude, acelerometro_x, acelerometro_y, acelerometro_z,
      magnitude, nivel_bateria, tipo_rede, timestamp, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      log.usuario_id ?? null,
      log.latitude,
      log.longitude,
      sanitize(log.acelerometro_x),
      sanitize(log.acelerometro_y),
      sanitize(log.acelerometro_z),
      sanitize(log.magnitude),
      sanitize(log.nivel_bateria),
      log.tipo_rede || null,
      log.timestamp || new Date().toISOString(),
      log.synced ?? 0,
    ]
  );
  return result.lastInsertRowId;
}


export async function getLogCount(): Promise<number> {
  const database = getDatabase();
  const result = await database.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM ${TABLE_NAME}`
  );
  return result?.count ?? 0;
}


export async function getLastLog(): Promise<SensorLog | null> {
  const database = getDatabase();
  const result = await database.getFirstAsync<SensorLog>(
    `SELECT * FROM ${TABLE_NAME} ORDER BY id DESC LIMIT 1`
  );
  return result ?? null;
}

export async function getAllLogs(): Promise<SensorLog[]> {
  const database = getDatabase();
  return await database.getAllAsync<SensorLog>(
    `SELECT * FROM ${TABLE_NAME} ORDER BY id DESC LIMIT 100`
  );
}


export async function deleteAllLogs(): Promise<void> {
  const database = getDatabase();
  await database.runAsync(`DELETE FROM ${TABLE_NAME}`);
}


/**
 * Logs ainda não enviados que podem ser sincronizados pelo usuário atual:
 * os dele e os coletados sem ninguém logado. Logs de outro usuário que
 * saiu da conta ficam aguardando o próximo login dele.
 */
export async function getUnsyncedLogs(usuarioId: number | null): Promise<SensorLog[]> {
  const database = getDatabase();
  if (usuarioId === null) {
    return await database.getAllAsync<SensorLog>(
      `SELECT * FROM ${TABLE_NAME} WHERE synced = 0 AND usuario_id IS NULL ORDER BY id ASC`
    );
  }
  return await database.getAllAsync<SensorLog>(
    `SELECT * FROM ${TABLE_NAME}
     WHERE synced = 0 AND (usuario_id IS NULL OR usuario_id = ?)
     ORDER BY id ASC`,
    [usuarioId]
  );
}


export async function markLogsAsSynced(ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  const database = getDatabase();
  const placeholders = ids.map(() => '?').join(',');

  console.log(`[DB] Executando UPDATE: marcando IDs ${ids.join(',')} como sincronizados.`);

  await database.runAsync(
    `UPDATE ${TABLE_NAME} SET synced = 1 WHERE id IN (${placeholders})`,
    ids
  );

  // Verificação rápida
  const check = await database.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM ${TABLE_NAME} WHERE id IN (${placeholders}) AND synced = 1`,
    ids
  );
  console.log(`[DB] Verificação: ${check?.count} registros agora estão com synced=1.`);
}


// ─── Sessão do usuário ───────────────────────────────────────────────
// Guardada no próprio SQLite para o app abrir logado mesmo sem internet.

const CHAVE_SESSAO = 'sessao_atual';

export async function getSessao(): Promise<Sessao | null> {
  const database = await initDatabase();
  const row = await database.getFirstAsync<{ valor: string }>(
    `SELECT valor FROM ${SESSION_TABLE_NAME} WHERE chave = ?`,
    [CHAVE_SESSAO]
  );
  if (!row) return null;
  try {
    return JSON.parse(row.valor) as Sessao;
  } catch {
    return null;
  }
}

export async function salvarSessao(sessao: Sessao): Promise<void> {
  const database = await initDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO ${SESSION_TABLE_NAME} (chave, valor) VALUES (?, ?)`,
    [CHAVE_SESSAO, JSON.stringify(sessao)]
  );
}

export async function limparSessao(): Promise<void> {
  const database = await initDatabase();
  await database.runAsync(`DELETE FROM ${SESSION_TABLE_NAME} WHERE chave = ?`, [CHAVE_SESSAO]);
}
