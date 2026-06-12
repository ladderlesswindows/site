/**
 * @file index.ts
 * @location src/core/jobs/index.ts
 * @description Barrel export for the job domain layer (modular monolith style).
 * 
 * Preferred usage:
 * - Feature screens: import narrow hooks like { useWalls, useSafety, useCloseout }
 * - Legacy / full access during transition: useJobDraft
 * - Direct data layer (advanced): JobRepository via createJobRepository (mostly internal now)
 */

export * from "./types";
export * from "./job-draft-context";
export * from "./job-repository";
export * from "./useWalls";
export * from "./useSafety";
export * from "./useCloseout";
export { savePhotoPermanently, deleteJobPhotos } from "./photo-storage";
export { exportJobToSpreadsheet, exportAllPastJobsToCSV } from "./export-to-spreadsheet";
