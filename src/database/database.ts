/** Gerenciamento do banco de dados SQLite local e persistência de logs */
import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME, TABLE_NAME } from '../constants';
import { SensorLog } from '../types';

let db: SQLite.SQLiteDatabase | null = null;


export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync(DATABASE_NAME);

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sensor_type TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      accel_x REAL,
      accel_y REAL,
      accel_z REAL,
      magnitude REAL,
      battery_level REAL,
      network_type TEXT,
      synced INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  return db;
}


export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}


export async function insertSensorLog(log: Omit<SensorLog, 'id'>): Promise<number> {
  const database = getDatabase();
  const result = await database.runAsync(
    `INSERT INTO ${TABLE_NAME} 
     (sensor_type, latitude, longitude, accel_x, accel_y, accel_z, magnitude, battery_level, network_type, synced, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      log.sensor_type,
      log.latitude ?? null,
      log.longitude ?? null,
      log.accel_x ?? null,
      log.accel_y ?? null,
      log.accel_z ?? null,
      log.magnitude ?? null,
      log.battery_level ?? null,
      log.network_type ?? null,
      log.synced,
      log.created_at,
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


export async function getUnsyncedLogs(): Promise<SensorLog[]> {
  const database = getDatabase();
  return await database.getAllAsync<SensorLog>(
    `SELECT * FROM ${TABLE_NAME} WHERE synced = 0 ORDER BY id ASC`
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
