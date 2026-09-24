/** Serviço para sincronização de logs — WebSocket (primário) com fallback HTTP */
import { getUnsyncedLogs, markLogsAsSynced } from '../database/database';
import { API_URL } from '../constants';
import { wsService } from './websocket';
import { getToken, getUsuarioId } from './auth';

// Evita dois envios simultâneos do mesmo lote (a coleta dispara um sync a cada gravação,
// e offline/rede lenta uma tentativa pode demorar mais que o intervalo de coleta).
let syncEmAndamento: Promise<number> | null = null;

/**
 * Sincroniza logs pendentes com o servidor.
 * Tenta primeiro via WebSocket (conexão persistente).
 * Se WS não estiver disponível, faz fallback para HTTP POST.
 * Com usuário logado, o token vai junto e o backend associa os registros a ele.
 */
export function syncLogsWithApi(): Promise<number> {
  if (!syncEmAndamento) {
    syncEmAndamento = sincronizar().finally(() => {
      syncEmAndamento = null;
    });
  }
  return syncEmAndamento;
}

async function sincronizar(): Promise<number> {
  try {
    const token = getToken();
    const unsyncedLogs = await getUnsyncedLogs(getUsuarioId());

    if (unsyncedLogs.length === 0) {
      console.log('[Sync] Nenhum log pendente para sincronizar.');
      return 0;
    }

    console.log(`[Sync] ${unsyncedLogs.length} logs pendentes. WS conectado: ${wsService.isConnected}`);

    let syncedCount: number | null = null;

    // ------ Tentativa 1: WebSocket (tempo real) ------
    if (wsService.isConnected) {
      console.log('[Sync] Enviando via WebSocket...');
      syncedCount = await wsService.sendLogs(unsyncedLogs, token);

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
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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
