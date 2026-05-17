import * as Battery from 'expo-battery';
import { BatteryData } from '../types';
import { BATTERY_INTERVAL_MS } from '../constants';

type BatteryCallback = (data: BatteryData) => void;

let batteryInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Get the current battery state.
 */
async function getBatteryState(): Promise<BatteryData> {
  const level = await Battery.getBatteryLevelAsync();
  const state = await Battery.getBatteryStateAsync();
  return {
    level,
    isCharging: state === Battery.BatteryState.CHARGING || state === Battery.BatteryState.FULL,
  };
}

/**
 * Start polling battery state every BATTERY_INTERVAL_MS.
 */
export function startBatteryMonitor(callback: BatteryCallback): void {
  // Stop any existing monitor
  stopBatteryMonitor();

  // Get initial reading immediately
  getBatteryState().then(callback).catch(console.warn);

  // Poll at interval
  batteryInterval = setInterval(async () => {
    try {
      const data = await getBatteryState();
      callback(data);
    } catch (error) {
      console.warn('[Battery] Error reading state:', error);
    }
  }, BATTERY_INTERVAL_MS);
}

/**
 * Stop polling battery state.
 */
export function stopBatteryMonitor(): void {
  if (batteryInterval) {
    clearInterval(batteryInterval);
    batteryInterval = null;
  }
}
