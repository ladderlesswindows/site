/**
 * @file job-draft-context.tsx
 * @location src/core/jobs/job-draft-context.tsx
 * @description
 * Thin orchestrator and in-memory state machine for the active job draft.
 * 
 * Responsibilities:
 * - Manage draft lifecycle (create/load/complete/discard) via the JobRepository
 * - Hold transient UI state (e.g. pendingWallPhotoUri) and computed values
 * - Provide the wide legacy useJobDraft() API during transition
 * - Dispatch reducer actions for local optimistic updates
 * 
 * All persistence (DB reads/writes) is now delegated to the real JobRepository.
 * This file is no longer the god object.
 * 
 * New code should prefer the narrow slice hooks:
 *   useWalls(), useSafety(), useCloseout()
 * 
 * Long-term vision:
 * - This context stays small (<250 LOC)
 * - JobRepository owns all SQLite access
 * - Features own their domain logic, hooks, and actions
 * 
 * Behavior is preserved 100% during the incremental split.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  ReactNode,
} from "react";
import { useSQLiteContext } from "expo-sqlite";
import * as Crypto from "expo-crypto";
import { File } from "expo-file-system";
import { useMemo } from "react";
import {
  Job,
  Section,
  FinalPhoto,
  JobWithDetails,
  CreateJobInput,
  CreateSectionInput,
  UpdateSectionInput,
} from "./types";
import { savePhotoPermanently, deleteJobPhotos } from "./photo-storage";
import { createJobRepository } from "./job-repository";

interface DraftState {
  currentJob: JobWithDetails | null;
  isLoading: boolean;
  error: string | null;
  pendingWallPhotoUri: string | null;
}

type DraftAction =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; payload: JobWithDetails | null }
  | { type: "LOAD_ERROR"; payload: string }
  | { type: "SET_JOB_META"; payload: Partial<Pick<Job, "address" | "customer_name">> }
  | { type: "ADD_SECTION"; payload: Section }
  | { type: "UPDATE_SECTION"; payload: { id: string; changes: Partial<Section> } }
  | { type: "REMOVE_SECTION"; payload: string }
  | { type: "SET_BEFORE_CLEAN_PHOTO"; payload: string }
  | { type: "SET_AFTER_CLEAN_PHOTO"; payload: string }
  | { type: "SET_SCREENS_CLEANED"; payload: number }
  | { type: "ADD_FINAL_PHOTO"; payload: FinalPhoto }
  | { type: "REMOVE_FINAL_PHOTO"; payload: string }
  | { type: "SET_FINAL_NOTES"; payload: string }
  | { type: "SET_CUSTOMER_DETAILS"; payload: Partial<Pick<Job, "contact_person" | "address_notes" | "phone" | "email" | "mailing_list" | "how_find" | "customer_rating">> }
  | { type: "SET_ENGAGED_START"; payload: string }
  | { type: "SET_WORK_START"; payload: string }
  | { type: "SET_END_TIME"; payload: string }
  | { type: "SET_SAFETY_CHECKS"; payload: string }
  | { type: "CLEAR_DRAFT" }
  | { type: "SET_PENDING_WALL_PHOTO"; payload: string }
  | { type: "CLEAR_PENDING_WALL_PHOTO" };

const initialState: DraftState = {
  currentJob: null,
  isLoading: true,
  error: null,
  pendingWallPhotoUri: null,
};

function draftReducer(state: DraftState, action: DraftAction): DraftState {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, isLoading: true, error: null };
    case "LOAD_SUCCESS":
      return { currentJob: action.payload, isLoading: false, error: null, pendingWallPhotoUri: null };
    case "LOAD_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    case "SET_JOB_META":
      if (!state.currentJob) return state;
      return {
        ...state,
        currentJob: {
          ...state.currentJob,
          ...action.payload,
        },
      };
    case "ADD_SECTION":
      if (!state.currentJob) return state;
      return {
        ...state,
        currentJob: {
          ...state.currentJob,
          sections: [...state.currentJob.sections, action.payload].sort(
            (a, b) => a.sort_order - b.sort_order
          ),
        },
      };
    case "UPDATE_SECTION":
      if (!state.currentJob) return state;
      return {
        ...state,
        currentJob: {
          ...state.currentJob,
          sections: state.currentJob.sections.map((s) =>
            s.id === action.payload.id ? { ...s, ...action.payload.changes } : s
          ),
        },
      };
    case "REMOVE_SECTION":
      if (!state.currentJob) return state;
      return {
        ...state,
        currentJob: {
          ...state.currentJob,
          sections: state.currentJob.sections.filter((s) => s.id !== action.payload),
        },
      };
    case "SET_BEFORE_CLEAN_PHOTO":
      if (!state.currentJob) return state;
      return {
        ...state,
        currentJob: {
          ...state.currentJob,
          before_clean_photo_uri: action.payload,
        },
      };
    case "SET_AFTER_CLEAN_PHOTO":
      if (!state.currentJob) return state;
      return {
        ...state,
        currentJob: {
          ...state.currentJob,
          after_clean_photo_uri: action.payload,
        },
      };
    case "SET_SCREENS_CLEANED":
      if (!state.currentJob) return state;
      return {
        ...state,
        currentJob: {
          ...state.currentJob,
          screens_cleaned: action.payload,
        },
      };
    case "ADD_FINAL_PHOTO":
      if (!state.currentJob) return state;
      return {
        ...state,
        currentJob: {
          ...state.currentJob,
          final_photos: [...state.currentJob.final_photos, action.payload].sort(
            (a, b) => a.sort_order - b.sort_order
          ),
        },
      };
    case "REMOVE_FINAL_PHOTO":
      if (!state.currentJob) return state;
      return {
        ...state,
        currentJob: {
          ...state.currentJob,
          final_photos: state.currentJob.final_photos.filter(
            (p) => p.id !== action.payload
          ),
        },
      };
    case "SET_FINAL_NOTES":
      if (!state.currentJob) return state;
      return {
        ...state,
        currentJob: {
          ...state.currentJob,
          final_notes: action.payload,
        },
      };
    case "SET_CUSTOMER_DETAILS":
      if (!state.currentJob) return state;
      return {
        ...state,
        currentJob: {
          ...state.currentJob,
          ...action.payload,
        },
      };
    case "SET_ENGAGED_START":
      if (!state.currentJob) return state;
      return {
        ...state,
        currentJob: {
          ...state.currentJob,
          engaged_start: action.payload,
        },
      };
    case "SET_WORK_START":
      if (!state.currentJob) return state;
      return {
        ...state,
        currentJob: {
          ...state.currentJob,
          work_start: action.payload,
        },
      };
    case "SET_END_TIME":
      if (!state.currentJob) return state;
      return {
        ...state,
        currentJob: {
          ...state.currentJob,
          end_time: action.payload,
        },
      };
    case "SET_SAFETY_CHECKS":
      if (!state.currentJob) return state;
      return {
        ...state,
        currentJob: {
          ...state.currentJob,
          safety_checks: action.payload,
        },
      };
    case "SET_PENDING_WALL_PHOTO":
      return { ...state, pendingWallPhotoUri: action.payload };
    case "CLEAR_PENDING_WALL_PHOTO":
      return { ...state, pendingWallPhotoUri: null };
    case "CLEAR_DRAFT":
      return { ...initialState, isLoading: false };
    default:
      return state;
  }
}

interface JobDraftContextValue extends DraftState {
  // Job lifecycle
  createDraft: (input?: CreateJobInput) => Promise<string>;
  loadDraft: () => Promise<void>;
  discardDraft: () => Promise<void>;

  // Meta
  updateJobMeta: (meta: Partial<Pick<Job, "address" | "customer_name">>) => Promise<void>;

  // Sections (walls)
  addSection: (input: CreateSectionInput, photoSourceUri: string) => Promise<Section>;
  updateSection: (sectionId: string, changes: UpdateSectionInput) => Promise<void>;
  removeSection: (sectionId: string) => Promise<void>;

  // Transient wall capture (photo taken via camera, awaiting counts + commit)
  setPendingWallPhoto: (uri: string) => void;
  clearPendingWallPhoto: () => void;

  // Clean step
  setBeforeCleanPhoto: (photoSourceUri: string) => Promise<void>;
  setAfterCleanPhoto: (photoSourceUri: string) => Promise<void>;
  setScreensCleaned: (count: number) => Promise<void>;

  // Final
  addFinalPhoto: (photoSourceUri: string) => Promise<void>;
  removeFinalPhoto: (photoId: string) => Promise<void>;
  setFinalNotes: (notes: string) => Promise<void>;

  // Customer / follow-up details (optional fields collected before Complete Job)
  updateCustomerDetails: (details: Partial<Pick<Job, "contact_person" | "address_notes" | "phone" | "email" | "mailing_list" | "how_find" | "customer_rating">>) => Promise<void>;

  // Time tracking (engaged = overall clocked-in time including drive, work = actual on-site time)
  startEngagedTime: () => Promise<void>;
  startWorkTime: () => Promise<void>;
  setEndTime: () => Promise<void>;

  // High-level actions
  clockOut: () => Promise<void>;           // Ends shift timer + resets current gig data
  resetGig: () => Promise<void>;           // Alias for discardDraft (clearer name for UI)

  // Safety Action Plan
  setSafetyChecks: (checks: string[]) => Promise<void>;

  // Complete
  completeJob: () => Promise<JobWithDetails>;

  // Computed
  totalWindows: number;
  totalScreens: number;
  hasDraft: boolean;
}

const JobDraftContext = createContext<JobDraftContextValue | null>(null);

export function JobDraftProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const jobRepo = useMemo(() => createJobRepository(db), [db]);
  const [state, dispatch] = useReducer(draftReducer, initialState);

  const totalWindows = state.currentJob?.sections.reduce((sum, s) => sum + s.windows, 0) ?? 0;
  const totalScreens = state.currentJob?.sections.reduce((sum, s) => sum + s.screens, 0) ?? 0;
  const hasDraft = !!state.currentJob;

  // Load the single active draft (if any)
  const loadDraft = useCallback(async () => {
    dispatch({ type: "LOAD_START" });
    try {
      const activeDraft = await jobRepo.findActiveDraft();
      if (!activeDraft) {
        dispatch({ type: "LOAD_SUCCESS", payload: null });
        return;
      }

      const jobWithDetails = await jobRepo.getJobWithDetails(activeDraft.id);
      dispatch({
        type: "LOAD_SUCCESS",
        payload: jobWithDetails,
      });
    } catch (err: any) {
      dispatch({ type: "LOAD_ERROR", payload: err.message || "Failed to load draft" });
    }
  }, [jobRepo]);

  // Create a new draft (or return existing if one is present)
  const createDraft = useCallback(
    async (input: CreateJobInput = {}): Promise<string> => {
      const existing = await jobRepo.findActiveDraft();
      if (existing) return existing.id;

      const id = await jobRepo.createDraft(input);

      await loadDraft();
      return id;
    },
    [jobRepo, loadDraft]
  );

  const discardDraft = useCallback(async () => {
    if (!state.currentJob) return;
    const jobId = state.currentJob.id;

    await jobRepo.discardDraft(jobId);

    await deleteJobPhotos(jobId);
    dispatch({ type: "CLEAR_DRAFT" });
  }, [jobRepo, state.currentJob]);

  const updateJobMeta = useCallback(
    async (meta: Partial<Pick<Job, "address" | "customer_name">>) => {
      if (!state.currentJob) return;

      const jobId = state.currentJob.id;
      await jobRepo.updateJobMeta(jobId, meta);

      dispatch({ type: "SET_JOB_META", payload: meta });
    },
    [jobRepo, state.currentJob]
  );

  // Add a new wall/section (copies photo to permanent storage first)
  const addSection = useCallback(
    async (input: CreateSectionInput, photoSourceUri: string): Promise<Section> => {
      if (!state.currentJob) throw new Error("No active draft job");

      const jobId = state.currentJob.id;
      const permanentUri = await savePhotoPermanently(jobId, photoSourceUri, "walls");

      const section = await jobRepo.addSection(jobId, input, permanentUri);

      dispatch({ type: "ADD_SECTION", payload: section });
      return section;
    },
    [jobRepo, state.currentJob]
  );

  const updateSection = useCallback(
    async (sectionId: string, changes: UpdateSectionInput) => {
      if (!state.currentJob) return;

      await jobRepo.updateSection(sectionId, changes as any);

      dispatch({ type: "UPDATE_SECTION", payload: { id: sectionId, changes: changes as any } });
    },
    [jobRepo, state.currentJob]
  );

  const removeSection = useCallback(
    async (sectionId: string) => {
      if (!state.currentJob) return;

      // Find and delete the photo file
      const section = state.currentJob.sections.find((s) => s.id === sectionId);
      if (section?.photo_uri) {
        try {
          const f = new File(section.photo_uri);
          if (f.exists) await f.delete();
        } catch {}
      }

      await jobRepo.removeSection(sectionId);
      dispatch({ type: "REMOVE_SECTION", payload: sectionId });
    },
    [jobRepo, state.currentJob]
  );

  const setBeforeCleanPhoto = useCallback(
    async (photoSourceUri: string) => {
      if (!state.currentJob) return;

      const jobId = state.currentJob.id;
      const permanentUri = await savePhotoPermanently(jobId, photoSourceUri, "before-clean");

      await jobRepo.setBeforeCleanPhoto(jobId, permanentUri);

      dispatch({ type: "SET_BEFORE_CLEAN_PHOTO", payload: permanentUri });
    },
    [jobRepo, state.currentJob]
  );

  const setAfterCleanPhoto = useCallback(
    async (photoSourceUri: string) => {
      if (!state.currentJob) return;

      const jobId = state.currentJob.id;
      const permanentUri = await savePhotoPermanently(jobId, photoSourceUri, "after-clean");

      await jobRepo.setAfterCleanPhoto(jobId, permanentUri);

      dispatch({ type: "SET_AFTER_CLEAN_PHOTO", payload: permanentUri });
    },
    [jobRepo, state.currentJob]
  );

  const setScreensCleaned = useCallback(
    async (count: number) => {
      if (!state.currentJob) return;
      const jobId = state.currentJob.id;

      await jobRepo.setScreensCleaned(jobId, count);
      dispatch({ type: "SET_SCREENS_CLEANED", payload: count });
    },
    [jobRepo, state.currentJob]
  );

  const setPendingWallPhoto = useCallback((uri: string) => {
    dispatch({ type: "SET_PENDING_WALL_PHOTO", payload: uri });
  }, []);

  const clearPendingWallPhoto = useCallback(() => {
    dispatch({ type: "CLEAR_PENDING_WALL_PHOTO" });
  }, []);

  const addFinalPhoto = useCallback(
    async (photoSourceUri: string) => {
      if (!state.currentJob) return;

      const jobId = state.currentJob.id;
      const permanentUri = await savePhotoPermanently(jobId, photoSourceUri, "final");

      const photoId = Crypto.randomUUID();
      const nextSort = (state.currentJob.final_photos.at(-1)?.sort_order ?? 0) + 1;

      const photo: FinalPhoto = {
        id: photoId,
        job_id: jobId,
        photo_uri: permanentUri,
        sort_order: nextSort,
      };

      await jobRepo.insertFinalPhoto(photo);

      dispatch({ type: "ADD_FINAL_PHOTO", payload: photo });
    },
    [jobRepo, state.currentJob]
  );

  const removeFinalPhoto = useCallback(
    async (photoId: string) => {
      if (!state.currentJob) return;

      const photo = state.currentJob.final_photos.find((p) => p.id === photoId);
      if (photo?.photo_uri) {
        try {
          const f = new File(photo.photo_uri);
          if (f.exists) await f.delete();
        } catch {}
      }

      await jobRepo.deleteFinalPhoto(photoId);
      dispatch({ type: "REMOVE_FINAL_PHOTO", payload: photoId });
    },
    [jobRepo, state.currentJob]
  );

  const setFinalNotes = useCallback(
    async (notes: string) => {
      if (!state.currentJob) return;
      const jobId = state.currentJob.id;

      await jobRepo.setFinalNotes(jobId, notes);
      dispatch({ type: "SET_FINAL_NOTES", payload: notes });
    },
    [jobRepo, state.currentJob]
  );

  const updateCustomerDetails = useCallback(
    async (details: Partial<Pick<Job, "contact_person" | "address_notes" | "phone" | "email" | "mailing_list" | "how_find" | "customer_rating">>) => {
      if (!state.currentJob) return;

      const jobId = state.currentJob.id;
      await jobRepo.updateCustomerDetails(jobId, details);

      dispatch({ type: "SET_CUSTOMER_DETAILS", payload: details });
    },
    [jobRepo, state.currentJob]
  );

  const startEngagedTime = useCallback(async () => {
    if (!state.currentJob) return;
    const jobId = state.currentJob.id;

    // Only set if not already started
    if (state.currentJob.engaged_start) return;

    const now = new Date().toISOString();
    await jobRepo.setEngagedStart(jobId, now);
    dispatch({ type: "SET_ENGAGED_START", payload: now });
  }, [jobRepo, state.currentJob]);

  const startWorkTime = useCallback(async () => {
    if (!state.currentJob) return;
    const jobId = state.currentJob.id;

    // Only set if not already started
    if (state.currentJob.work_start) return;

    const now = new Date().toISOString();
    await jobRepo.setWorkStart(jobId, now);
    dispatch({ type: "SET_WORK_START", payload: now });
  }, [jobRepo, state.currentJob]);

  const setEndTime = useCallback(async () => {
    if (!state.currentJob) return;
    const jobId = state.currentJob.id;
    const now = new Date().toISOString();

    await jobRepo.setEndTime(jobId, now);
    dispatch({ type: "SET_END_TIME", payload: now });
  }, [jobRepo, state.currentJob]);

  // Clock Out = End the overall shift + completely reset any current gig
  const clockOut = useCallback(async () => {
    if (!state.currentJob) return;

    await setEndTime();
    await discardDraft();
  }, [setEndTime, discardDraft]);

  const setSafetyChecks = useCallback(async (checks: string[]) => {
    if (!state.currentJob) return;
    const jobId = state.currentJob.id;
    const json = JSON.stringify(checks);

    await jobRepo.setSafetyChecks(jobId, json);
    dispatch({ type: "SET_SAFETY_CHECKS", payload: json });
  }, [jobRepo, state.currentJob]);

  // Finalize the draft → completed job. Returns the completed record.
  const completeJob = useCallback(async (): Promise<JobWithDetails> => {
    if (!state.currentJob) throw new Error("No draft to complete");

    const jobId = state.currentJob.id;

    await jobRepo.completeJob(jobId, { total_windows: totalWindows, total_screens: totalScreens });

    // Reload to get fresh data
    await loadDraft();

    // Return the now-completed job using repo
    const jobWithDetails = await jobRepo.getJobWithDetails(jobId);
    if (!jobWithDetails) throw new Error("Failed to load completed job");

    return jobWithDetails;
  }, [jobRepo, state.currentJob, totalWindows, totalScreens, loadDraft]);

  // Auto-load draft on mount
  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  const value: JobDraftContextValue = {
    ...state,
    createDraft,
    loadDraft,
    discardDraft,
    resetGig: discardDraft,   // nicer name for UI buttons
    updateJobMeta,
    addSection,
    updateSection,
    removeSection,
    setBeforeCleanPhoto,
    setAfterCleanPhoto,
    setScreensCleaned,
    setPendingWallPhoto,
    clearPendingWallPhoto,
    addFinalPhoto,
    removeFinalPhoto,
    setFinalNotes,
    updateCustomerDetails,
    startEngagedTime,
    startWorkTime,
    setEndTime,
    clockOut,
    setSafetyChecks,
    completeJob,
    totalWindows,
    totalScreens,
    hasDraft,
  };

  return <JobDraftContext.Provider value={value}>{children}</JobDraftContext.Provider>;
}

export function useJobDraft() {
  const ctx = useContext(JobDraftContext);
  if (!ctx) {
    throw new Error("useJobDraft must be used inside a JobDraftProvider");
  }
  return ctx;
}
