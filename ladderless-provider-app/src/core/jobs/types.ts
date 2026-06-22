export type JobStatus = "draft" | "completed";

export interface Job {
  id: string;
  status: JobStatus;
  started_at: string;
  completed_at: string | null;
  address: string | null;
  customer_name: string | null;
  screens_cleaned: number;
  before_clean_photo_uri: string | null;
  after_clean_photo_uri: string | null;
  final_notes: string | null;
  total_windows: number;
  total_screens: number;

  // New time tracking (as per your request)
  engaged_start: string | null;   // Set on the dedicated "Clock In" page (overall engaged time)
  work_start: string | null;      // Set on "Begin Gig" (actual working time on site)
  end_time: string | null;        // Set on final "Complete Job" — currently closes both timers

  // Miles tracking
  miles_driven: number;

  // Safety Action Plan selections (stored as JSON array of strings)
  safety_checks: string | null;

  // Customer / follow-up details (collected on final / complete step)
  contact_person: string | null;
  address_notes: string | null;
  phone: string | null;
  email: string | null;
  mailing_list: number | null;   // 1 = yes, 0 = no, null = unspecified
  how_find: string | null;
  customer_rating: number | null; // 1-5 rating (shown as "Internal" in UI, "Client Rating" in spreadsheets)

  // Linked Supabase booking (set when starting a gig from the gig list)
  supabase_booking_id: string | null;
}

export interface Section {
  id: string;
  job_id: string;
  photo_uri: string;
  windows: number;
  screens: number;
  notes: string | null;
  sort_order: number;
}

export interface FinalPhoto {
  id: string;
  job_id: string;
  photo_uri: string;
  sort_order: number;
}

export interface JobWithDetails extends Job {
  sections: Section[];
  final_photos: FinalPhoto[];
}

// Input types for creating/updating
export interface CreateJobInput {
  address?: string | null;
  customer_name?: string | null;
}

export interface CreateSectionInput {
  photo_uri: string;
  windows: number;
  screens: number;
  notes?: string | null;
}

export interface UpdateSectionInput {
  windows?: number;
  screens?: number;
  notes?: string | null;
}
