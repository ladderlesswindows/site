/**
 * @file useWeather.ts
 * @location src/features/weather/useWeather.ts
 * @description
 * The brain of the weather feature.
 * 
 * Responsibilities:
 * - Fetch weather from Open-Meteo (only when `enabled` is true)
 * - Cache the last successful result in AsyncStorage (survives app restarts)
 * - Auto-refresh every 5 minutes while the consuming screen is active + enabled
 * - Expose last fetch time so the widget can show "stale" state
 * - Provide manual refresh capability
 * 
 * Key behavior (per product requirements):
 * - Real API calls ONLY happen on Clock-in and Begin Gig screens (when enabled=true)
 * - All other pages just render the last cached value (enabled=false)
 */

import { useState, useEffect, useCallback } from "react";
import { Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchCurrentWeather } from "./weather-api";
import { WeatherData, CachedWeather, WeatherWarning } from "./types";
import { getWeatherWarnings } from "./weather-warnings";

// Use the centralized location module for proper modular monolith structure
import {
  getCurrentLocationWithPermission,
  requestLocationPermission,
} from "@/features/location";

const CACHE_KEY = "weather:last";
const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

interface UseWeatherOptions {
  /** When true, this hook is allowed to make network requests */
  enabled: boolean;
  /** Auto-refresh interval in ms (default 5 minutes) */
  refreshInterval?: number;
}

interface UseWeatherResult {
  data: WeatherData | null;
  warnings: WeatherWarning[];
  lastFetched: Date | null;
  isLoading: boolean;
  isStale: boolean;           // true if older than 5 minutes
  error: string | null;
  refresh: () => Promise<void>;
  /** Requests location permission and then refreshes if granted */
  requestLocationAndRefresh: () => Promise<void>;
  /** Opens the app's page in iOS Settings (needed when user previously denied permission) */
  openLocationSettings: () => void;
  timeUntilRefresh: number;   // seconds until next auto refresh (for UI)
}

export function useWeather({
  enabled,
  refreshInterval = REFRESH_INTERVAL_MS,
}: UseWeatherOptions): UseWeatherResult {
  const [data, setData] = useState<WeatherData | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load cached data on mount (always, regardless of enabled)
  useEffect(() => {
    loadCachedWeather();
  }, []);

  const loadCachedWeather = async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: CachedWeather = JSON.parse(cached);
        if (parsed.data) {
          setData(parsed.data);
          if (parsed.lastFetched) {
            setLastFetched(new Date(parsed.lastFetched));
          }
        }
      }
    } catch (e) {
      console.warn("[Weather] Failed to load cached weather", e);
    }
  };

  const saveToCache = async (newData: WeatherData) => {
    const cacheEntry: CachedWeather = {
      data: newData,
      lastFetched: new Date().toISOString(),
    };
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheEntry));
    } catch (e) {
      console.warn("[Weather] Failed to persist weather cache", e);
    }
  };

  const fetchWeather = useCallback(async (force = false) => {
    if (!enabled && !force) return;

    setIsLoading(true);
    setError(null);

    try {
      // Use the shared location service (maintains clean features modular structure)
      const location = await getCurrentLocationWithPermission();

      if (!location) {
        throw new Error("Location access denied");
      }

      const weather = await fetchCurrentWeather(
        location.latitude,
        location.longitude
      );

      setData(weather);
      const now = new Date();
      setLastFetched(now);

      await saveToCache(weather);
    } catch (err: any) {
      console.error("[Weather] Fetch failed", err);
      setError(err.message || "Unable to fetch weather");
      // Keep showing last cached data if available
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  // Auto-refresh logic: only active when this hook instance is "enabled"
  useEffect(() => {
    if (!enabled) return;

    // Initial fetch on mount if we have no data or it's stale
    const isStale = !lastFetched || (Date.now() - lastFetched.getTime() > refreshInterval);
    if (!data || isStale) {
      fetchWeather();
    }

    // Set up recurring refresh while this screen is active
    const interval = setInterval(() => {
      fetchWeather();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [enabled, data, lastFetched, refreshInterval, fetchWeather]);

  // Derived values
  const isStale = !lastFetched || (Date.now() - lastFetched.getTime() > refreshInterval);
  const timeUntilRefresh = lastFetched
    ? Math.max(0, Math.floor((lastFetched.getTime() + refreshInterval - Date.now()) / 1000))
    : 0;

  const warnings = data ? getWeatherWarnings(data) : [];

  const refresh = async () => {
    await fetchWeather(true);
  };

  /**
   * Dedicated method for the UI:
   * - Calls the permission dialog
   * - If granted, immediately tries to fetch fresh weather
   * - If still denied, sets a helpful error
   */
  const requestLocationAndRefresh = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Delegate to the centralized location service
      const status = await requestLocationPermission();

      if (status === "granted") {
        await fetchWeather(true);
      } else {
        // On iOS, once denied, the dialog won't show again — user must go to Settings.
        setError("Location access is denied.");
      }
    } catch (err: any) {
      console.error("[Weather] Permission request failed", err);
      setError("Could not request location permission.");
    } finally {
      setIsLoading(false);
    }
  };

  const openLocationSettings = () => {
    Linking.openSettings();
  };

  return {
    data,
    warnings,
    lastFetched,
    isLoading,
    isStale,
    error,
    refresh,
    requestLocationAndRefresh,
    openLocationSettings,
    timeUntilRefresh,
  };
}
