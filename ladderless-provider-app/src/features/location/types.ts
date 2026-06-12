/**
 * @file types.ts
 * @location src/features/location/types.ts
 * @description
 * Shared types for the location feature module.
 * This keeps location concerns properly encapsulated in the modular monolith.
 */

export type LocationPermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface CurrentLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}
