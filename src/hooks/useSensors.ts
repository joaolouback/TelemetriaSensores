import { useState, useCallback, useRef } from 'react';
import {
  LocationData,
  AccelerometerData,
  BatteryData,
  ConnectivityData,
  SensorState,
} from '../types';
import { startLocationUpdates, stopLocationUpdates } from '../sensors/location';
import { startAccelerometer, stopAccelerometer } from '../sensors/accelerometer';
import { startBatteryMonitor, stopBatteryMonitor } from '../sensors/battery';
import { startConnectivityMonitor, stopConnectivityMonitor } from '../sensors/connectivity';

const DEFAULT_CONNECTIVITY: ConnectivityData = {
  type: 'unknown',
  isConnected: false,
};

/**
 * Custom hook that manages all sensor subscriptions.
 * Provides start/stop lifecycle and current readings.
 */
export function useSensors() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [accelerometer, setAccelerometer] = useState<AccelerometerData | null>(null);
  const [battery, setBattery] = useState<BatteryData | null>(null);
  const [connectivity, setConnectivity] = useState<ConnectivityData>(DEFAULT_CONNECTIVITY);
  const isRunning = useRef(false);

  const startAll = useCallback(async () => {
    if (isRunning.current) return;
    isRunning.current = true;

    try {
      // Start location (async – needs permissions)
      await startLocationUpdates((data: LocationData) => {
        setLocation(data);
      });
    } catch (error) {
      console.warn('[useSensors] Location error:', error);
    }

    // Start accelerometer
    startAccelerometer((data: AccelerometerData) => {
      setAccelerometer(data);
    });

    // Start battery monitor
    startBatteryMonitor((data: BatteryData) => {
      setBattery(data);
    });

    // Start connectivity monitor
    startConnectivityMonitor((data: ConnectivityData) => {
      setConnectivity(data);
    });
  }, []);

  const stopAll = useCallback(() => {
    isRunning.current = false;
    stopLocationUpdates();
    stopAccelerometer();
    stopBatteryMonitor();
    stopConnectivityMonitor();
  }, []);

  const sensorState: SensorState = {
    location,
    accelerometer,
    battery,
    connectivity,
  };

  return {
    sensorState,
    location,
    accelerometer,
    battery,
    connectivity,
    startSensors: startAll,
    stopSensors: stopAll,
  };
}
