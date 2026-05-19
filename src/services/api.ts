import { getUnsyncedLogs, markLogsAsSynced } from '../database/database';
import { API_URL } from '../constants';
import { SensorLog } from '../types';


export async function syncLogsWithApi(): Promise<number> {
  try {
    const unsyncedLogs = await getUnsyncedLogs();
    
    if (unsyncedLogs.length === 0) {
      return 0; 
    }

    const response = await fetch(`${API_URL}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(unsyncedLogs),
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const syncedIds = unsyncedLogs.map(log => log.id).filter((id): id is number => id !== undefined);
    
    if (syncedIds.length > 0) {
      await markLogsAsSynced(syncedIds);
    }

    return syncedIds.length;
  } catch (error) {
    console.error('[API Sync] Failed to sync logs:', error);
    return 0;
  }
}
