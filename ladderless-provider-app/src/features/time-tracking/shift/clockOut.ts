/**
 * clockOut.ts
 * 
 * This module is responsible for the "Clock Out" action.
 * 
 * Clock Out should:
 * - End the overall shift timer (engaged time)
 * - Clear any in-progress gig data and photos (via discardDraft)
 * - Return the user to the initial Clock In screen
 * 
 * This is intentionally placed under time-tracking/shift because
 * Clock Out primarily concerns ending the Shift Time.
 * 
 * Future improvement: Move the actual end-shift + reset logic here
 * instead of calling setEndTime + discardDraft directly from pages.
 */

import { useJobDraft } from "@/core/jobs/job-draft-context";

/**
 * useClockOut
 *
 * Convenient hook for components that need the full "Clock Out" action.
 *
 * Under the hood it calls the `clockOut()` method on JobDraftContext,
 * which does:
 *   - setEndTime()   → closes the overall shift/engaged timer
 *   - discardDraft() → wipes the current gig + all photos
 *
 * This is the recommended way to trigger clock out from UI.
 */
export function useClockOut() {
  const { clockOut } = useJobDraft();

  return {
    clockOut,
  };
}


