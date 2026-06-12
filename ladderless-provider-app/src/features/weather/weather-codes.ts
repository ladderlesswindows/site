/**
 * @file weather-codes.ts
 * @location src/features/weather/weather-codes.ts
 * @description
 * WMO Weather Code mapping for Open-Meteo.
 * 
 * We keep this separate so it's easy to tweak descriptions or add icons later.
 * 
 * Reference: https://open-meteo.com/en/docs
 */

export interface WeatherCondition {
  code: number;
  description: string;
  isBad: boolean; // used for automatic warning generation
}

export const weatherConditions: Record<number, WeatherCondition> = {
  0:  { code: 0,  description: "Clear",                isBad: false },
  1:  { code: 1,  description: "Mainly Clear",         isBad: false },
  2:  { code: 2,  description: "Partly Cloudy",        isBad: false },
  3:  { code: 3,  description: "Overcast",             isBad: false },
  45: { code: 45, description: "Fog",                  isBad: true  },
  48: { code: 48, description: "Depositing Rime Fog",  isBad: true  },
  51: { code: 51, description: "Light Drizzle",        isBad: false },
  53: { code: 53, description: "Moderate Drizzle",     isBad: true  },
  55: { code: 55, description: "Dense Drizzle",        isBad: true  },
  61: { code: 61, description: "Slight Rain",          isBad: false },
  63: { code: 63, description: "Moderate Rain",        isBad: true  },
  65: { code: 65, description: "Heavy Rain",           isBad: true  },
  71: { code: 71, description: "Slight Snow",          isBad: true  },
  73: { code: 73, description: "Moderate Snow",        isBad: true  },
  75: { code: 75, description: "Heavy Snow",           isBad: true  },
  80: { code: 80, description: "Rain Showers",         isBad: true  },
  81: { code: 81, description: "Heavy Rain Showers",   isBad: true  },
  82: { code: 82, description: "Violent Rain Showers", isBad: true  },
  85: { code: 85, description: "Snow Showers",         isBad: true  },
  86: { code: 86, description: "Heavy Snow Showers",   isBad: true  },
  95: { code: 95, description: "Thunderstorm",         isBad: true  },
  96: { code: 96, description: "Thunderstorm + Hail",  isBad: true  },
  99: { code: 99, description: "Heavy Thunderstorm",   isBad: true  },
};

export function getWeatherCondition(code: number): string {
  return weatherConditions[code]?.description ?? "Unknown";
}

export function isSevereWeather(code: number): boolean {
  return weatherConditions[code]?.isBad ?? false;
}
