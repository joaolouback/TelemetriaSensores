import * as Location from 'expo-location';
import { LocationData } from '../types';
import { GPS_INTERVAL_MS } from '../constants';

type LocationCallback = (data: LocationData) => void;

let locationSubscription: Location.LocationSubscription | null = null;


export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}


export async function startLocationUpdates(callback: LocationCallback): Promise<void> {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    console.warn('[Location] Permission denied');
    return;
  }

  stopLocationUpdates();

  locationSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: GPS_INTERVAL_MS,
      distanceInterval: 10, 
    },
    (location) => {
      callback({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      });
    }
  );
}


export function stopLocationUpdates(): void {
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
  }
}
