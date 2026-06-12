/**
 * @file weather-api.ts
 * @location src/features/weather/weather-api.ts
 * @description
 * Thin wrapper around the free Open-Meteo API.
 * 
 * No API key required. We request current conditions including wind gusts
 * (very important for water-fed pole work).
 * 
 * Units are requested in imperial (mph, °F) to match the user's field workflow.
 */

import { WeatherData } from "./types";
import { getWeatherCondition } from "./weather-codes";

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

interface OpenMeteoCurrent {
  temperature_2m: number;
  wind_speed_10m: number;
  wind_gusts_10m: number;
  wind_direction_10m: number;
  weather_code: number;
  time: string;
}

interface OpenMeteoResponse {
  current: OpenMeteoCurrent;
  current_units: {
    temperature_2m: string;
    wind_speed_10m: string;
  };
}

/**
 * Fetches current weather from Open-Meteo for the given coordinates.
 * Returns data normalized to our WeatherData shape (all imperial).
 */
export async function fetchCurrentWeather(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: "temperature_2m,wind_speed_10m,wind_gusts_10m,wind_direction_10m,weather_code",
    wind_speed_unit: "mph",
    temperature_unit: "fahrenheit",
    timezone: "auto",
  });

  const response = await fetch(`${OPEN_METEO_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  const data: OpenMeteoResponse = await response.json();
  const current = data.current;

  return {
    temperature: Math.round(current.temperature_2m),
    windSpeed: Math.round(current.wind_speed_10m),
    windGusts: Math.round(current.wind_gusts_10m ?? current.wind_speed_10m),
    windDirection: Math.round(current.wind_direction_10m),
    weatherCode: current.weather_code,
    condition: getWeatherCondition(current.weather_code),
    time: current.time,
  };
}

/**
 * Converts wind direction degrees into cardinal direction (N, NE, E, etc.)
 */
export function getWindDirectionLabel(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}
