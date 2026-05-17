import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import { ConnectivityData } from '../types';

type ConnectivityCallback = (data: ConnectivityData) => void;

let unsubscribe: NetInfoSubscription | null = null;

/**
 * Parse NetInfo state into our ConnectivityData type.
 */
function parseNetInfoState(state: NetInfoState): ConnectivityData {
  let type: ConnectivityData['type'] = 'unknown';

  if (!state.isConnected) {
    type = 'none';
  } else if (state.type === 'wifi') {
    type = 'wifi';
  } else if (state.type === 'cellular') {
    type = 'cellular';
  }

  return {
    type,
    isConnected: state.isConnected ?? false,
  };
}

/**
 * Start monitoring connectivity changes in real time.
 */
export function startConnectivityMonitor(callback: ConnectivityCallback): void {
  // Stop any existing subscription
  stopConnectivityMonitor();

  // Get initial state
  NetInfo.fetch().then((state) => {
    callback(parseNetInfoState(state));
  });

  // Subscribe to changes
  unsubscribe = NetInfo.addEventListener((state) => {
    callback(parseNetInfoState(state));
  });
}

/**
 * Stop monitoring connectivity.
 */
export function stopConnectivityMonitor(): void {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}

/**
 * Get current connectivity state once.
 */
export async function getCurrentConnectivity(): Promise<ConnectivityData> {
  const state = await NetInfo.fetch();
  return parseNetInfoState(state);
}
