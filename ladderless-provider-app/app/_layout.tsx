/**
 * @file _layout.tsx
 * @location app/_layout.tsx
 * @description
 * Root layout for the entire Ladderless Provider app.
 * 
 * Responsibilities:
 * - Sets up the three critical providers (SQLite, Job state, Theme)
 * - Applies the defensive NativeWind v5 patch early
 * - Runs DB migrations on first launch / schema evolution
 * - Defines the top-level Stack navigator chrome
 * 
 * This file is intentionally kept relatively small. Feature-specific navigation
 * lives in the (group) _layout files (e.g. new-job/_layout.tsx).
 */

import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SQLiteProvider } from "expo-sqlite";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { JobDraftProvider } from "@/core/jobs/job-draft-context";
import { applyReactNativeCssPatches } from "@/core/utils/patch-react-native-css";
import { ThemeProvider } from "@/core/theme-context";

// Apply defensive patches for react-native-css / NativeWind v5 preview early
applyReactNativeCssPatches();

async function migrateDbIfNeeded(db: any) {
  // Enable WAL for performance (recommended in SDK 54 docs)
  await db.execAsync("PRAGMA journal_mode = WAL;");
  await db.execAsync("PRAGMA foreign_keys = ON;");

  // Create tables for jobs, sections, and final photos
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('draft', 'completed')),
      started_at TEXT NOT NULL,
      completed_at TEXT,
      address TEXT,
      customer_name TEXT,
      screens_cleaned INTEGER NOT NULL DEFAULT 0,
      before_clean_photo_uri TEXT,
      after_clean_photo_uri TEXT,
      final_notes TEXT,
      contact_person TEXT,
      address_notes TEXT,
      phone TEXT,
      email TEXT,
      mailing_list INTEGER,
      how_find TEXT,
      customer_rating INTEGER,
      total_windows INTEGER NOT NULL DEFAULT 0,
      total_screens INTEGER NOT NULL DEFAULT 0,

      -- Time tracking columns (engaged = overall clocked in time, work = actual gig/working time)
      engaged_start TEXT,
      work_start TEXT,
      end_time TEXT,

      -- Miles tracking
      miles_driven REAL DEFAULT 0,

      -- Safety Action Plan (stored as JSON array)
      safety_checks TEXT
    );

    CREATE TABLE IF NOT EXISTS sections (
      id TEXT PRIMARY KEY NOT NULL,
      job_id TEXT NOT NULL,
      photo_uri TEXT NOT NULL,
      windows INTEGER NOT NULL DEFAULT 0,
      screens INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      sort_order INTEGER NOT NULL,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS final_photos (
      id TEXT PRIMARY KEY NOT NULL,
      job_id TEXT NOT NULL,
      photo_uri TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_sections_job_id ON sections(job_id);
    CREATE INDEX IF NOT EXISTS idx_final_photos_job_id ON final_photos(job_id);
  `);

  // Add new columns if they don't exist (for users who already have the old DB)
  // These will fail silently if the columns are already there.
  try { await db.execAsync(`ALTER TABLE jobs ADD COLUMN engaged_start TEXT;`); } catch {}
  try { await db.execAsync(`ALTER TABLE jobs ADD COLUMN work_start TEXT;`); } catch {}
  try { await db.execAsync(`ALTER TABLE jobs ADD COLUMN end_time TEXT;`); } catch {}
  try { await db.execAsync(`ALTER TABLE jobs ADD COLUMN miles_driven REAL DEFAULT 0;`); } catch {}
  try { await db.execAsync(`ALTER TABLE jobs ADD COLUMN safety_checks TEXT;`); } catch {}
  try { await db.execAsync(`ALTER TABLE jobs ADD COLUMN after_clean_photo_uri TEXT;`); } catch {}
  try { await db.execAsync(`ALTER TABLE jobs ADD COLUMN contact_person TEXT;`); } catch {}
  try { await db.execAsync(`ALTER TABLE jobs ADD COLUMN address_notes TEXT;`); } catch {}
  try { await db.execAsync(`ALTER TABLE jobs ADD COLUMN phone TEXT;`); } catch {}
  try { await db.execAsync(`ALTER TABLE jobs ADD COLUMN email TEXT;`); } catch {}
  try { await db.execAsync(`ALTER TABLE jobs ADD COLUMN mailing_list INTEGER;`); } catch {}
  try { await db.execAsync(`ALTER TABLE jobs ADD COLUMN how_find TEXT;`); } catch {}
  try { await db.execAsync(`ALTER TABLE jobs ADD COLUMN customer_rating INTEGER;`); } catch {}
  try { await db.execAsync(`ALTER TABLE jobs ADD COLUMN supabase_booking_id TEXT;`); } catch {}
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SQLiteProvider
        databaseName="ladderless-jobs.db"
        onInit={migrateDbIfNeeded}
        onError={(error) => console.error("SQLite error:", error)}
      >
        <JobDraftProvider>
          <ThemeProvider>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: "#1e40af", // Deep professional blue
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "600",
              },
              headerShown: false, // Default to no native header (custom BrandingHeader + titles used instead; re-enable per-screen only where needed)
            }}
          >
            {/* Splash - using grouped route name so configuration is reliable after reorganization */}
            <Stack.Screen
              name="(splash)/index"
              options={{
                title: "Welcome",
                headerShown: false, // Full immersive black screen with logo
              }}
            />
            {/* Temporary beta welcome screen (colorful 2s splash) */}
            <Stack.Screen
              name="(welcome)/welcome"
              options={{
                headerShown: false,
              }}
            />
            {/* Clock-in - using grouped route name */}
            <Stack.Screen
              name="(clock-in)/clock-in"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="(address-navigation)/home"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen name="(past-jobs)/previous-jobs" />
            <Stack.Screen name="(past-jobs)/previous-jobs/[id]" />

            {/* Note: native headers are hidden by default in screenOptions for post-address pages (walls, screens, previous-jobs, etc.).
                They use custom <BrandingHeader /> or inline titles + bottom "Back" links instead. */}
          </Stack>
          <StatusBar style="light" />
          </ThemeProvider>
        </JobDraftProvider>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
