import { useJobDraft } from "@/core/jobs/job-draft-context";

/**
 * useResetGig
 *
 * Convenient hook for components that need to reset the current gig.
 *
 * This is a thin wrapper around `resetGig()` on the JobDraftContext.
 * It clears all current gig data and photos without necessarily ending
 * the overall shift timer (use `useClockOut` if you want to end the shift too).
 *
 * Recommended for any "Reset Gig" buttons across the app.
 */
export function useResetGig() {
  const { resetGig } = useJobDraft();

  return {
    resetGig,
  };
}
