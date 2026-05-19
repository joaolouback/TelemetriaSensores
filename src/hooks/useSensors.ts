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
      await startLocationUpdates((data: LocationData) => {
        setLocation(data);
      });
    } catch (error) {
      console.warn('[useSensors] Location error:', error);
    }

    startAccelerometer((data: AccelerometerData) => {
      setAccelerometer(data);
    });

    startBatteryMonitor((data: BatteryData) => {
      setBattery(data);
    });

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
