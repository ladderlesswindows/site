/**
 * @file constants.ts
 * @location src/core/constants.ts
 * @description
 * Application-wide constants and magic numbers.
 * 
 * Centralizing these makes the app easier to tune (e.g. "what is the max walls per job?")
 * and documents business rules that came from the field (glove-friendly design, etc.).
 * 
 * All values here are intentionally conservative and based on real usage feedback.
 */

import type { Section } from './jobs/types';

/** Maximum number of walls/sections that can be documented per job. */
export const MAX_WALLS = 20;

/** Maximum final "hero" photos allowed on the closeout step. */
export const MAX_FINAL_PHOTOS = 4;

/** Hard cap on final notes length (prevents runaway text in SQLite). */
export const MAX_NOTES_LENGTH = 2000;

/** Safety Action Plan options shown on clock-in (order is intentional). */
export const SAFETY_OPTIONS = [
  'Client Nearby',
  'Smartwatch Charged',
  'Assistant on site',
] as const;

export type SafetyOption = (typeof SAFETY_OPTIONS)[number];

/** Camera usage modes (passed via expo-router search params today). */
export const CAMERA_MODES = {
  WALL: 'wall',
  BEFORE_SCREENS: 'before-screens',
  AFTER_SCREENS: 'after-screens',
  FINAL: 'final',
} as const;

export type CameraMode = (typeof CAMERA_MODES)[keyof typeof CAMERA_MODES];

/** Default values for new jobs / forms. */
export const DEFAULTS = {
  MILES: 0,
  WINDOWS: 0,
  SCREENS: 0,
} as const;

/** Time tracking labels (used in UI + spreadsheet headers). */
export const TIME_LABELS = {
  ENGAGED: 'Engaged Time',
  GIG: 'Gig / Working Time',
} as const;

/** Spreadsheet export sheet names (exact order matters for bookkeeping). */
export const SPREADSHEET_SHEETS = {
  SUMMARY: 'Job Summary',
  WALLS: 'Walls',
  FINAL_PHOTOS: 'Final Photos',
} as const;

/**
 * Helper to check if a job has reached the wall limit.
 * Used in walls screen before allowing another camera open.
 */
export function hasReachedWallLimit(sections: Section[]): boolean {
  return sections.length >= MAX_WALLS;
}
