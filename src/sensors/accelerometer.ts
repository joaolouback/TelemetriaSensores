import { Accelerometer as ExpoAccelerometer } from 'expo-sensors';
import { AccelerometerData } from '../types';
import { ACCELEROMETER_INTERVAL_MS } from '../constants';
import { calculateMagnitude } from '../utils';
import { Subscription } from 'expo-sensors/build/DeviceSensor';

type AccelerometerCallback = (data: AccelerometerData) => void;

let subscription: Subscription | null = null;


export function startAccelerometer(callback: AccelerometerCallback): void {
  stopAccelerometer();

  ExpoAccelerometer.setUpdateInterval(ACCELEROMETER_INTERVAL_MS);

  subscription = ExpoAccelerometer.addListener((rawData) => {
    const { x, y, z } = rawData;
    callback({
      x,
      y,
      z,
      magnitude: calculateMagnitude(x, y, z),
    });
  });
}


export function stopAccelerometer(): void {
  if (subscription) {
    subscription.remove();
    subscription = null;
  }
}


export async function isAccelerometerAvailable(): Promise<boolean> {
  return ExpoAccelerometer.isAvailableAsync();
}
