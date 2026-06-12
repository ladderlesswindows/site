/**
 * @file useCloseout.ts
 * @location src/core/jobs/useCloseout.ts
 * @description
 * Closeout / completion feature slice.
 * 
 * Recommended API for final step, summary, and high-level gig reset actions.
 * Exposes only closeout-relevant data and actions (final photos, notes, complete, clockOut, etc.).
 * Helps isolate the final phase from the rest of the job state.
 */

import { useJobDraft } from "./job-draft-context";

export function useCloseout() {
  const ctx = useJobDraft();

  // Focused wrapper for the closeout domain.
  return {
    finalPhotos: ctx.currentJob?.final_photos ?? [],
    finalNotes: ctx.currentJob?.final_notes ?? "",
    addFinalPhoto: ctx.addFinalPhoto,
    removeFinalPhoto: ctx.removeFinalPhoto,
    setFinalNotes: ctx.setFinalNotes,
    setEndTime: ctx.setEndTime,
    completeJob: ctx.completeJob,

    // High-level actions (convenience for closeout flows)
    clockOut: ctx.clockOut,
    resetGig: ctx.resetGig,
  };
}
