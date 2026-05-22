/** Serviço para sincronização de logs locais com a API REST remota */
import { getUnsyncedLogs, markLogsAsSynced } from '../database/database';
import { API_URL } from '../constants';
import { SensorLog } from '../types';


export async function syncLogsWithApi(): Promise<number> {
  try {
    const unsyncedLogs = await getUnsyncedLogs();

    if (unsyncedLogs.length === 0) {
      console.log('[API Sync] Nenhum log pendente para sincronizar.');
      return 0;
    }

    console.log(`[API Sync] Tentando sincronizar ${unsyncedLogs.length} logs...`);

    const response = await fetch(`${API_URL}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(unsyncedLogs),
    });

    console.log(`[API Sync] Resposta da API: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const syncedIds = unsyncedLogs.map(log => log.id).filter((id): id is number => id !== undefined);

    console.log(`[API Sync] Sucesso! Marcando ${syncedIds.length} IDs como sincronizados:`, syncedIds);

    if (syncedIds.length > 0) {
      await markLogsAsSynced(syncedIds);
    }

    return syncedIds.length;
  } catch (error) {
    console.error('[API Sync] Falha crítica na sincronização:', error);
    return 0;
  }
}
