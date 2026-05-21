/** Módulo para monitoramento do nível e status de carregamento da bateria */
import * as Battery from 'expo-battery';
import { BatteryData } from '../types';
import { BATTERY_INTERVAL_MS } from '../constants';

type BatteryCallback = (data: BatteryData) => void;

let batteryInterval: ReturnType<typeof setInterval> | null = null;


async function getBatteryState(): Promise<BatteryData> {
  const level = await Battery.getBatteryLevelAsync();
  const state = await Battery.getBatteryStateAsync();
  return {
    level,
    isCharging: state === Battery.BatteryState.CHARGING || state === Battery.BatteryState.FULL,
  };
}


export function startBatteryMonitor(callback: BatteryCallback): void {
  stopBatteryMonitor();

  getBatteryState().then(callback).catch(console.warn);

  batteryInterval = setInterval(async () => {
    try {
      const data = await getBatteryState();
      callback(data);
    } catch (error) {
      console.warn('[Battery] Error reading state:', error);
    }
  }, BATTERY_INTERVAL_MS);
}


export function stopBatteryMonitor(): void {
  if (batteryInterval) {
    clearInterval(batteryInterval);
    batteryInterval = null;
  }
}
