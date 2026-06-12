/**
 * Time Tracking Feature Module
 * 
 * This module is being prepared to separate two distinct concepts:
 * 
 * - **Gig Time** (Work Time): The time actually spent working on the job.
 *   This should eventually be visible/persistent across all screens while a gig is active.
 * 
 * - **Shift Time** (Engaged Time): The overall time the user is "on the clock"
 *   from the initial Clock In until final completion.
 *   This should generally remain hidden during the gig and only surface
 *   at job completion and in the spreadsheet export.
 * 
 * Current state:
 * - Time tracking logic still lives primarily in src/core/jobs/job-draft-context.tsx
 *   (startEngagedTime, startWorkTime, etc.)
 * 
 * Future goal:
 * - Extract gig time into a visible, reusable component + hook.
 * - Keep shift time logic more private / only exposed when needed.
 */

export * from './gig/useGigTimer';
export * from './shift/useShiftTimer';
export * from './shift/clockOut';
export * from './shift/useResetGig';

// Placeholder for when we build the visible GigTimer component
// export { GigTimer } from './gig/GigTimer';
