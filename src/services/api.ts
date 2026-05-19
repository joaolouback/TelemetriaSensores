import { getUnsyncedLogs, markLogsAsSynced } from '../database/database';
import { API_URL } from '../constants';
import { SensorLog } from '../types';

/**
 * Syncs unsynchronized logs to the remote API.
 * Returns the number of logs successfully synced.
 */
export async function syncLogsWithApi(): Promise<number> {
  try {
    const unsyncedLogs = await getUnsyncedLogs();
    
    if (unsyncedLogs.length === 0) {
      return 0; // Nothing to sync
    }

    // Attempt to send data to the API
    const response = await fetch(`${API_URL}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Assuming your API expects { logs: SensorLog[] } or similar
      body: JSON.stringify(unsyncedLogs),
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    // Assuming API is successful, mark these IDs as synced
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
