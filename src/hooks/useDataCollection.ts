import { useState, useCallback, useRef, useEffect } from 'react';
import { CollectionStatus, SensorState } from '../types';
import { insertSensorLog } from '../database/database';
import { SAVE_INTERVAL_MS, SENSOR_TYPES } from '../constants';
import { syncLogsWithApi } from '../services/api';

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
      await insertSensorLog({
        sensor_type: SENSOR_TYPES.COMBINED,
        latitude: current.location?.latitude ?? null,
        longitude: current.location?.longitude ?? null,
        accel_x: current.accelerometer?.x ?? null,
        accel_y: current.accelerometer?.y ?? null,
        accel_z: current.accelerometer?.z ?? null,
        magnitude: current.accelerometer?.magnitude ?? null,
        battery_level: current.battery?.level ?? null,
        network_type: current.connectivity?.type ?? null,
        synced: 0,
        created_at: new Date().toISOString(),
      });

      setSaveCount((prev) => prev + 1);
      onSaved?.();

      syncLogsWithApi().catch(console.error);
    } catch (error) {
      console.error('[useDataCollection] Save error:', error);
    }
  }, [onSaved]);

  const startCollection = useCallback(() => {
    if (saveTimerRef.current) return;

    setStatus(CollectionStatus.COLLECTING);
    setSaveCount(0);

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
    setStatus(CollectionStatus.STOPPED);
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, []);

  return {
    status,
    saveCount,
    startCollection,
    stopCollection,
  };
}
