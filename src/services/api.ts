/** Serviço para sincronização de logs — WebSocket (primário) com fallback HTTP */
import { getUnsyncedLogs, markLogsAsSynced } from '../database/database';
import { API_URL } from '../constants';
import { wsService } from './websocket';

/**
 * Sincroniza logs pendentes com o servidor.
 * Tenta primeiro via WebSocket (conexão persistente).
 * Se WS não estiver disponível, faz fallback para HTTP POST.
 */
export async function syncLogsWithApi(): Promise<number> {
  try {
    const unsyncedLogs = await getUnsyncedLogs();

    if (unsyncedLogs.length === 0) {
      console.log('[Sync] Nenhum log pendente para sincronizar.');
      return 0;
    }

    console.log(`[Sync] ${unsyncedLogs.length} logs pendentes. WS conectado: ${wsService.isConnected}`);

    let syncedCount: number | null = null;

    // ------ Tentativa 1: WebSocket (tempo real) ------
    if (wsService.isConnected) {
      console.log('[Sync] Enviando via WebSocket...');
      syncedCount = await wsService.sendLogs(unsyncedLogs);

      if (syncedCount !== null) {
        console.log(`[Sync] WebSocket OK! ${syncedCount} logs sincronizados.`);
      } else {
        console.warn('[Sync] WebSocket falhou, tentando HTTP...');
      }
    }

    // ------ Tentativa 2: HTTP POST (fallback) ------
    if (syncedCount === null) {
      console.log('[Sync] Enviando via HTTP POST /sync...');
      const response = await fetch(`${API_URL}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unsyncedLogs),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      syncedCount = unsyncedLogs.length;
      console.log(`[Sync] HTTP OK! ${syncedCount} logs sincronizados.`);
    }

    // ------ Marca como sincronizados no SQLite ------
    const syncedIds = unsyncedLogs
      .map((log) => log.id)
      .filter((id): id is number => id !== undefined);

    if (syncedIds.length > 0) {
      await markLogsAsSynced(syncedIds);
    }

    return syncedIds.length;
  } catch (error) {
    console.error('[Sync] Falha crítica na sincronização:', error);
    return 0;
  }
}
