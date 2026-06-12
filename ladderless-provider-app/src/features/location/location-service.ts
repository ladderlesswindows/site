/**
 * @file location-service.ts
 * @location src/features/location/location-service.ts
 * @description
 * Centralized location service for the app.
 * 
 * This module was created to maintain the clean features-based modular monolith structure.
 * Previously, location logic was duplicated/scattered in weather and home screens.
 * 
 * All components and features should go through this service for location needs.
 */

import * as Location from 'expo-location';
import { CurrentLocation, LocationPermissionStatus } from './types';

/**
 * Requests foreground location permission.
 * Returns the resulting status.
 */
export async function requestLocationPermission(): Promise<LocationPermissionStatus> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status === 'granted') return 'granted';
    if (status === 'denied') return 'denied';
    return 'undetermined';
  } catch (error) {
    console.warn('[LocationService] Permission request failed', error);
    return 'denied';
  }
}

/**
 * Gets the user's current position.
 * Assumes permission has already been granted (call requestLocationPermission first).
 */
export async function getCurrentPosition(): Promise<CurrentLocation> {
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracy: location.coords.accuracy ?? undefined,
  };
}

/**
 * Convenience method: requests permission and gets location if granted.
 * Returns null if permission is not granted.
 */
export async function getCurrentLocationWithPermission(): Promise<CurrentLocation | null> {
  const status = await requestLocationPermission();

  if (status !== 'granted') {
    return null;
  }

  try {
    return await getCurrentPosition();
  } catch (error) {
    console.error('[LocationService] Failed to get position after permission grant', error);
    return null;
  }
}
