/** Hook para orquestrar a coleta periódica de dados e sincronização com a API */
import { useState, useCallback, useRef, useEffect } from 'react';
import { CollectionStatus, SensorState } from '../types';
import { insertSensorLog } from '../database/database';
import { SAVE_INTERVAL_MS } from '../constants';
import { syncLogsWithApi } from '../services/api';
import { getUsuarioId } from '../services/auth';
import { wsService } from '../services/websocket';

interface UseDataCollectionOptions {
  sensorState: SensorState;
  onSaved?: () => void;
}


export function useDataCollection({ sensorState, onSaved }: UseDataCollectionOptions) {
  const [status, setStatus] = useState<CollectionStatus>(CollectionStatus.IDLE);
  const [saveCount, setSaveCount] = useState(0);
  const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sensorStateRef = useRef<SensorState>(sensorState);

  useEffect(() => {
    sensorStateRef.current = sensorState;
  }, [sensorState]);

  const saveSensorData = useCallback(async () => {
    const current = sensorStateRef.current;

    try {
      // Sem GPS ainda (app acabou de abrir, sem permissão ou em local fechado):
      // o registro não serviria para geolocalização, então não é gravado.
      if (current.location) {
        await insertSensorLog({
          usuario_id: getUsuarioId(),
          latitude: current.location.latitude,
          longitude: current.location.longitude,
          acelerometro_x: current.accelerometer?.x ?? null,
          acelerometro_y: current.accelerometer?.y ?? null,
          acelerometro_z: current.accelerometer?.z ?? null,
          magnitude: current.accelerometer?.magnitude ?? null,
          nivel_bateria: current.battery ? Math.round(current.battery.level * 100) : null,
          tipo_rede: current.connectivity?.type ?? null,
          timestamp: new Date().toISOString(),
          synced: 0,
        });

        setSaveCount((prev) => prev + 1);
        onSaved?.();
      } else {
        console.log('[useDataCollection] Aguardando GPS — leitura não gravada.');
      }

      // Tenta enviar pendentes mesmo sem gravar agora (ex.: a rede acabou de voltar).
      syncLogsWithApi().catch(console.error);
    } catch (error) {
      console.error('[useDataCollection] Save error:', error);
    }
  }, [onSaved]);

  const startCollection = useCallback(() => {
    if (saveTimerRef.current) return;

    setStatus(CollectionStatus.COLLECTING);
    setSaveCount(0);

    // Inicia conexão WebSocket para sync em tempo real
    wsService.resetReconnect();
    wsService.connect();

    saveSensorData();

    saveTimerRef.current = setInterval(() => {
      saveSensorData();
    }, SAVE_INTERVAL_MS);
  }, [saveSensorData]);

  const stopCollection = useCallback(() => {
    if (saveTimerRef.current) {
      clearInterval(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    // Desconecta WebSocket ao parar coleta
    wsService.disconnect();

    setStatus(CollectionStatus.STOPPED);
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      // Cleanup: desconecta WS ao desmontar componente
      wsService.disconnect();
    };
  }, []);

  return {
    status,
    saveCount,
    startCollection,
    stopCollection,
  };
}
