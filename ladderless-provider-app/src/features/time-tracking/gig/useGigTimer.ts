/**
 * useGigTimer.ts
 * 
 * Future hook for managing Gig Time (the visible working time).
 * 
 * Goals when implemented:
 * - Start/stop the gig timer
 * - Provide a live, formatted elapsed time value
 * - Be usable from multiple screens (so the timer can stay visible globally)
 * - Possibly integrate with a persistent UI component (e.g. a top banner)
 * 
 * Current status: Placeholder. Logic still lives in job-draft-context.tsx
 */

export function useGigTimer() {
  // TODO: Implement gig-specific timer logic here.
  // This should eventually be independent from (or a clean wrapper around)
  // the work_start / end_time logic currently in the job context.

  return {
    // Placeholder return values
    elapsedSeconds: 0,
    formattedTime: '00:00',
    isRunning: false,
    startGig: () => {},
    stopGig: () => {},
  };
}
