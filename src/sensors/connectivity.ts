import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import { ConnectivityData } from '../types';

type ConnectivityCallback = (data: ConnectivityData) => void;

let unsubscribe: NetInfoSubscription | null = null;


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


export function startConnectivityMonitor(callback: ConnectivityCallback): void {
  stopConnectivityMonitor();

  NetInfo.fetch().then((state) => {
    callback(parseNetInfoState(state));
  });

  unsubscribe = NetInfo.addEventListener((state) => {
    callback(parseNetInfoState(state));
  });
}


export function stopConnectivityMonitor(): void {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}


export async function getCurrentConnectivity(): Promise<ConnectivityData> {
  const state = await NetInfo.fetch();
  return parseNetInfoState(state);
}
