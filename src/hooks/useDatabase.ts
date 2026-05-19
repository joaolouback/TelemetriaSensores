import { useState, useEffect, useCallback } from 'react';
import { SensorLog, StorageInfo } from '../types';
import {
  initDatabase,
  getLogCount,
  getLastLog,
  deleteAllLogs,
} from '../database/database';


export function useDatabase() {
  const [isReady, setIsReady] = useState(false);
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    recordCount: 0,
    lastRecord: null,
  });
  const [error, setError] = useState<string | null>(null);

 
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        await initDatabase();
        if (mounted) {
          setIsReady(true);
          await refreshStorageInfo();
        }
      } catch (err) {
        console.error('[useDatabase] Init error:', err);
        if (mounted) {
          setError('Erro ao inicializar banco de dados');
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);


  const refreshStorageInfo = useCallback(async () => {
    try {
      const [count, last] = await Promise.all([getLogCount(), getLastLog()]);
      setStorageInfo({
        recordCount: count,
        lastRecord: last,
      });
    } catch (err) {
      console.warn('[useDatabase] Refresh error:', err);
    }
  }, []);

  
  const clearDatabase = useCallback(async () => {
    try {
      await deleteAllLogs();
      setStorageInfo({ recordCount: 0, lastRecord: null });
    } catch (err) {
      console.error('[useDatabase] Clear error:', err);
      setError('Erro ao limpar banco de dados');
    }
  }, []);

  return {
    isReady,
    storageInfo,
    error,
    refreshStorageInfo,
    clearDatabase,
  };
}
