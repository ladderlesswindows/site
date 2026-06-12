/**
 * @file useSafety.ts
 * @location src/core/jobs/useSafety.ts
 * @description
 * Safety Action Plan feature slice.
 * 
 * Recommended API for clock-in and safety-related logic.
 * Isolates consumers from the full job context (only safety_checks + startEngagedTime).
 */

import { useJobDraft } from "./job-draft-context";

export function useSafety() {
  const ctx = useJobDraft();

  // Thin but focused wrapper. Provides domain isolation for the safety feature.
  return {
    safetyChecks: ctx.currentJob?.safety_checks,
    setSafetyChecks: ctx.setSafetyChecks,
    startEngagedTime: ctx.startEngagedTime,
  };
}
