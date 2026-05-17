import * as Location from 'expo-location';
import { LocationData } from '../types';
import { GPS_INTERVAL_MS } from '../constants';

type LocationCallback = (data: LocationData) => void;

let locationSubscription: Location.LocationSubscription | null = null;

/**
 * Request location permissions.
 * Returns true if granted.
 */
export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

/**
 * Start watching location updates.
 * Uses balanced accuracy and moderate interval to save battery.
 */
export async function startLocationUpdates(callback: LocationCallback): Promise<void> {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    console.warn('[Location] Permission denied');
    return;
  }

  // Stop any existing subscription
  stopLocationUpdates();

  locationSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: GPS_INTERVAL_MS,
      distanceInterval: 10, // minimum 10m movement
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

/**
 * Stop watching location updates and clean up.
 */
export function stopLocationUpdates(): void {
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
  }
}
