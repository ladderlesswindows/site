/**
 * @file types.ts
 * @location src/features/weather/types.ts
 * @description
 * Type definitions for the Weather feature.
 * 
 * All weather-related data shapes live here so the rest of the app
 * has a single source of truth.
 */

export interface WeatherData {
  temperature: number;           // in °F (we convert from API)
  windSpeed: number;             // sustained wind in mph
  windGusts: number;             // gust speed in mph (critical for pole work)
  windDirection: number;         // degrees (0-360)
  weatherCode: number;           // WMO weather code
  condition: string;             // human readable (e.g. "Partly Cloudy")
  time: string;                  // ISO timestamp of observation
}

export type WarningLevel = 'none' | 'moderate' | 'high' | 'severe';

export interface WeatherWarning {
  level: WarningLevel;
  title: string;
  message: string;
  color: string;                 // semantic color from design tokens
}

export interface CachedWeather {
  data: WeatherData | null;
  lastFetched: string | null;    // ISO timestamp
  location?: {
    latitude: number;
    longitude: number;
  };
}
