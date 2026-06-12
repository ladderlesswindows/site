/**
 * @file useWalls.ts
 * @location src/core/jobs/useWalls.ts
 * @description
 * Feature-specific hook for the walls/sections domain.
 * 
 * This is now the recommended public API for walls-related functionality.
 * Screens in the (walls) route group should import from here instead of the full useJobDraft().
 * 
 * Responsibilities:
 * - Expose sections data + derived totals (windows/screens)
 * - Manage pending photo for the add-wall capture flow
 * - Provide add/remove/update section actions (delegated to repository)
 * - Expose work time controls
 * 
 * Provides isolation: consumers only subscribe to walls-relevant parts of the job state.
 * This reduces re-render surface for unrelated changes (e.g. final notes or customer details).
 */

import { useJobDraft } from "./job-draft-context";
import type { Section, CreateSectionInput } from "./types";

/**
 * Hook for the walls / section capture feature.
 */
export function useWalls() {
  const ctx = useJobDraft();

  // Currently re-exports from the (now thinner) orchestrator context.
  // Future: will be a true narrow selector / derived state to avoid unnecessary re-renders.
  return {
    // State
    sections: ctx.currentJob?.sections ?? [],
    totalWindows: ctx.totalWindows,
    totalScreens: ctx.totalScreens,
    pendingWallPhotoUri: ctx.pendingWallPhotoUri,
    workStart: ctx.currentJob?.work_start ?? null,

    // Actions
    addSection: ctx.addSection,
    removeSection: ctx.removeSection,
    setPendingWallPhoto: ctx.setPendingWallPhoto,
    clearPendingWallPhoto: ctx.clearPendingWallPhoto,
    startWorkTime: ctx.startWorkTime,

    // Loading / error from root
    isLoading: ctx.isLoading,
  };
}
