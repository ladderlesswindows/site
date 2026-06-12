/**
 * @file job-repository.ts
 * @location src/core/jobs/job-repository.ts
 * @description
 * Pure data access layer for all job-related SQLite operations.
 * 
 * RESPONSIBILITIES (future):
 * - All INSERT / UPDATE / DELETE / SELECT for jobs, sections, final_photos
 * - Transactions
 * - Typed return values (no more `any`)
 * - Migration helpers if needed later
 * 
 * STATUS: Fully implemented (key part of Phase 2 god-object split).
 * All job-related SQLite operations live here exclusively.
 * The job-draft-context no longer contains raw DB calls and is now a thin orchestrator.
 * 
 * Benefits:
 * - No direct SQLite usage outside this layer (and photo-storage infra)
 * - Screens/features talk only to hooks or repo (via context during transition)
 * - Easy to unit test, cache, or replace persistence
 */

import { SQLiteDatabase } from "expo-sqlite";
import * as Crypto from "expo-crypto";
import {
  Job,
  Section,
  FinalPhoto,
  JobWithDetails,
  CreateJobInput,
  CreateSectionInput,
} from "./types";

/**
 * Example shape of what the repository will expose.
 * These methods will be implemented during the split.
 */
export interface JobRepository {
  // Job lifecycle
  findActiveDraft(): Promise<Job | null>;
  createDraft(input?: CreateJobInput): Promise<string>;
  updateJobMeta(jobId: string, meta: Partial<Pick<Job, "address" | "customer_name">>): Promise<void>;
  updateCustomerDetails(jobId: string, details: Partial<Pick<Job, "contact_person" | "address_notes" | "phone" | "email" | "mailing_list" | "how_find" | "customer_rating">>): Promise<void>;
  completeJob(jobId: string, totals: { total_windows: number; total_screens: number }): Promise<void>;

  // Time tracking
  setEngagedStart(jobId: string, timestamp: string): Promise<void>;
  setWorkStart(jobId: string, timestamp: string): Promise<void>;
  setEndTime(jobId: string, timestamp: string): Promise<void>;

  // Safety
  setSafetyChecks(jobId: string, checksJson: string): Promise<void>;

  // Sections (walls)
  getSectionsForJob(jobId: string): Promise<Section[]>;
  insertSection(section: Section): Promise<void>;
  updateSection(sectionId: string, changes: Partial<Section>): Promise<void>;
  deleteSection(sectionId: string): Promise<void>;

  // Screen cleaning photos
  setBeforeCleanPhoto(jobId: string, uri: string): Promise<void>;
  setAfterCleanPhoto(jobId: string, uri: string): Promise<void>;
  setScreensCleaned(jobId: string, count: number): Promise<void>;

  // Final photos
  getFinalPhotosForJob(jobId: string): Promise<FinalPhoto[]>;
  insertFinalPhoto(photo: FinalPhoto): Promise<void>;
  deleteFinalPhoto(photoId: string): Promise<void>;

  // Notes
  setFinalNotes(jobId: string, notes: string): Promise<void>;

  // Full hydrated job (used by detail views and completion)
  getJobWithDetails(jobId: string): Promise<JobWithDetails | null>;

  // Discard / reset
  discardDraft(jobId: string): Promise<void>;

  // High-level walls section ops (photo uri expected to be pre-saved permanent)
  addSection(jobId: string, input: CreateSectionInput, permanentUri: string): Promise<Section>;
  removeSection(sectionId: string): Promise<void>;
}

/**
 * Creates a real JobRepository implementation.
 * This moves all direct SQLite access out of the context / screens.
 * The context will become a thin orchestrator + in-memory state manager.
 */
export function createJobRepository(db: SQLiteDatabase): JobRepository {
  return {
    async findActiveDraft(): Promise<Job | null> {
      return db.getFirstAsync<Job>(
        "SELECT * FROM jobs WHERE status = 'draft' LIMIT 1"
      );
    },

    async createDraft(input: CreateJobInput = {}): Promise<string> {
      const id = Crypto.randomUUID();
      const now = new Date().toISOString();

      await db.runAsync(
        `INSERT INTO jobs (id, status, started_at, address, customer_name, screens_cleaned, total_windows, total_screens)
         VALUES (?, 'draft', ?, ?, ?, 0, 0, 0)`,
        [id, now, input.address ?? null, input.customer_name ?? null]
      );

      return id;
    },

    async updateJobMeta(jobId: string, meta: Partial<Pick<Job, "address" | "customer_name">>): Promise<void> {
      const fields: string[] = [];
      const values: any[] = [];

      if (meta.address !== undefined) {
        fields.push("address = ?");
        values.push(meta.address);
      }
      if (meta.customer_name !== undefined) {
        fields.push("customer_name = ?");
        values.push(meta.customer_name);
      }

      if (fields.length === 0) return;

      values.push(jobId);
      await db.runAsync(`UPDATE jobs SET ${fields.join(", ")} WHERE id = ?`, values);
    },

    async updateCustomerDetails(jobId: string, details: Partial<Pick<Job, "contact_person" | "address_notes" | "phone" | "email" | "mailing_list" | "how_find" | "customer_rating">>): Promise<void> {
      const fields: string[] = [];
      const values: any[] = [];

      const keys: (keyof typeof details)[] = [
        "contact_person", "address_notes", "phone", "email", "mailing_list", "how_find", "customer_rating",
      ];
      for (const k of keys) {
        if (details[k] !== undefined) {
          fields.push(`${k} = ?`);
          values.push(details[k]);
        }
      }

      if (fields.length === 0) return;

      values.push(jobId);
      await db.runAsync(`UPDATE jobs SET ${fields.join(", ")} WHERE id = ?`, values);
    },

    async setEngagedStart(jobId: string, timestamp: string): Promise<void> {
      await db.runAsync("UPDATE jobs SET engaged_start = ? WHERE id = ?", [timestamp, jobId]);
    },

    async setWorkStart(jobId: string, timestamp: string): Promise<void> {
      await db.runAsync("UPDATE jobs SET work_start = ? WHERE id = ?", [timestamp, jobId]);
    },

    async setEndTime(jobId: string, timestamp: string): Promise<void> {
      await db.runAsync("UPDATE jobs SET end_time = ? WHERE id = ?", [timestamp, jobId]);
    },

    async setSafetyChecks(jobId: string, checksJson: string): Promise<void> {
      await db.runAsync("UPDATE jobs SET safety_checks = ? WHERE id = ?", [checksJson, jobId]);
    },

    async getSectionsForJob(jobId: string): Promise<Section[]> {
      return db.getAllAsync<Section>(
        "SELECT * FROM sections WHERE job_id = ? ORDER BY sort_order",
        [jobId]
      );
    },

    async insertSection(section: Section): Promise<void> {
      await db.runAsync(
        "INSERT INTO sections (id, job_id, photo_uri, windows, screens, notes, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [section.id, section.job_id, section.photo_uri, section.windows, section.screens, section.notes, section.sort_order]
      );
    },

    async updateSection(sectionId: string, changes: Partial<Section>): Promise<void> {
      const fields: string[] = [];
      const values: any[] = [];

      if (changes.windows !== undefined) { fields.push("windows = ?"); values.push(changes.windows); }
      if (changes.screens !== undefined) { fields.push("screens = ?"); values.push(changes.screens); }
      if (changes.notes !== undefined) { fields.push("notes = ?"); values.push(changes.notes); }

      if (fields.length === 0) return;

      values.push(sectionId);
      await db.runAsync(`UPDATE sections SET ${fields.join(", ")} WHERE id = ?`, values);
    },

    async deleteSection(sectionId: string): Promise<void> {
      await db.runAsync("DELETE FROM sections WHERE id = ?", [sectionId]);
    },

    async setBeforeCleanPhoto(jobId: string, uri: string): Promise<void> {
      await db.runAsync("UPDATE jobs SET before_clean_photo_uri = ? WHERE id = ?", [uri, jobId]);
    },

    async setAfterCleanPhoto(jobId: string, uri: string): Promise<void> {
      await db.runAsync("UPDATE jobs SET after_clean_photo_uri = ? WHERE id = ?", [uri, jobId]);
    },

    async setScreensCleaned(jobId: string, count: number): Promise<void> {
      await db.runAsync("UPDATE jobs SET screens_cleaned = ? WHERE id = ?", [count, jobId]);
    },

    async getFinalPhotosForJob(jobId: string): Promise<FinalPhoto[]> {
      return db.getAllAsync<FinalPhoto>(
        "SELECT * FROM final_photos WHERE job_id = ? ORDER BY sort_order",
        [jobId]
      );
    },

    async insertFinalPhoto(photo: FinalPhoto): Promise<void> {
      await db.runAsync(
        "INSERT INTO final_photos (id, job_id, photo_uri, sort_order) VALUES (?, ?, ?, ?)",
        [photo.id, photo.job_id, photo.photo_uri, photo.sort_order]
      );
    },

    async deleteFinalPhoto(photoId: string): Promise<void> {
      await db.runAsync("DELETE FROM final_photos WHERE id = ?", [photoId]);
    },

    async setFinalNotes(jobId: string, notes: string): Promise<void> {
      await db.runAsync("UPDATE jobs SET final_notes = ? WHERE id = ?", [notes, jobId]);
    },

    async completeJob(jobId: string, totals: { total_windows: number; total_screens: number }): Promise<void> {
      const completedAt = new Date().toISOString();
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          `UPDATE jobs SET
            status = 'completed',
            completed_at = ?,
            total_windows = ?,
            total_screens = ?
           WHERE id = ?`,
          [completedAt, totals.total_windows, totals.total_screens, jobId]
        );
      });
    },

    async getJobWithDetails(jobId: string): Promise<JobWithDetails | null> {
      const job = await db.getFirstAsync<Job>("SELECT * FROM jobs WHERE id = ?", [jobId]);
      if (!job) return null;

      const sections = await db.getAllAsync<Section>(
        "SELECT * FROM sections WHERE job_id = ? ORDER BY sort_order",
        [jobId]
      );
      const finalPhotos = await db.getAllAsync<FinalPhoto>(
        "SELECT * FROM final_photos WHERE job_id = ? ORDER BY sort_order",
        [jobId]
      );

      return {
        ...job,
        sections,
        final_photos: finalPhotos,
      };
    },

    async discardDraft(jobId: string): Promise<void> {
      await db.withTransactionAsync(async () => {
        await db.runAsync("DELETE FROM final_photos WHERE job_id = ?", [jobId]);
        await db.runAsync("DELETE FROM sections WHERE job_id = ?", [jobId]);
        await db.runAsync("DELETE FROM jobs WHERE id = ?", [jobId]);
      });
    },

    async addSection(jobId: string, input: CreateSectionInput, permanentUri: string): Promise<Section> {
      const sections = await this.getSectionsForJob(jobId);
      const nextSort = (sections.at(-1)?.sort_order ?? 0) + 1;

      const sectionId = Crypto.randomUUID();
      const section: Section = {
        id: sectionId,
        job_id: jobId,
        photo_uri: permanentUri,
        windows: input.windows,
        screens: input.screens,
        notes: input.notes ?? null,
        sort_order: nextSort,
      };

      await db.runAsync(
        `INSERT INTO sections (id, job_id, photo_uri, windows, screens, notes, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          section.id,
          section.job_id,
          section.photo_uri,
          section.windows,
          section.screens,
          section.notes,
          section.sort_order,
        ]
      );

      return section;
    },

    async removeSection(sectionId: string): Promise<void> {
      await db.runAsync("DELETE FROM sections WHERE id = ?", [sectionId]);
    },
  };
}
