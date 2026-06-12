/**
 * @file weather-warnings.ts
 * @location src/features/weather/weather-warnings.ts
 * @description
 * Business logic for generating smart weather warnings.
 * 
 * Thresholds are tuned for water-fed pole work (user preference):
 * - Gusts are more important than sustained wind for pole stability.
 * - Warnings escalate in severity.
 */

import { WeatherData, WeatherWarning } from "./types";
import { isSevereWeather } from "./weather-codes";

const MPH_TO_KMH = 1.60934;

export function getWeatherWarnings(data: WeatherData): WeatherWarning[] {
  const warnings: WeatherWarning[] = [];
  const gustsMph = data.windGusts;

  // Wind warnings (gusts prioritized)
  if (gustsMph >= 25) {
    warnings.push({
      level: "severe",
      title: "Severe Wind — Do Not Work",
      message: `Gusts of ${gustsMph} mph. Poles are unsafe above 25 mph.`,
      color: "#dc2626", // danger
    });
  } else if (gustsMph >= 20) {
    warnings.push({
      level: "high",
      title: "High Wind Warning",
      message: `Gusts of ${gustsMph} mph. Use extra caution with poles.`,
      color: "#f97316", // orange
    });
  } else if (gustsMph >= 15) {
    warnings.push({
      level: "moderate",
      title: "Moderate Wind",
      message: `Gusts of ${gustsMph} mph. Be mindful of pole control.`,
      color: "#eab308", // yellow/amber
    });
  }

  // Severe weather code warnings
  if (isSevereWeather(data.weatherCode)) {
    warnings.push({
      level: warnings.length > 0 ? "high" : "moderate",
      title: "Poor Conditions",
      message: `${data.condition}. Consider delaying work.`,
      color: warnings.length > 0 ? "#f97316" : "#eab308",
    });
  }

  return warnings;
}
