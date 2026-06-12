# Time Tracking

This feature module is intended to manage the two different time concepts in the app:

## Gig Time (Work Time)
- Time actually spent working on the job.
- Started when the user taps **"Begin Gig"**.
- Should eventually be **visible and persistent** across screens while a gig is active (e.g. a small running timer at the top of the app).
- This is the time that matters most for productivity and job costing.

## Shift Time (Engaged Time)
- Overall time the user has been "on the clock".
- Started at the initial **Clock In** screen.
- Should generally stay **hidden** during the actual work.
- Only exposed at job completion and in the spreadsheet export.

---

### Current State (as of now)

Time tracking logic still lives inside:
- `src/core/jobs/job-draft-context.tsx`

The only visible timer currently exists inside:
- `app/(walls)/new-job/walls.tsx` (the big stopwatch after pressing Begin Gig)

### Future Direction

1. Extract Gig Time into its own feature with a reusable `GigTimer` component that can live persistently (likely via a provider or root layout component).
2. Keep Shift Time more encapsulated — only exposed when a job is completed or exported.

---

### Recommended Usage (2027-era modular monolith)

**Preferred way to trigger these actions from UI:**

```tsx
import { useResetGig, useClockOut } from "@/features/time-tracking";

const { resetGig } = useResetGig();
const { clockOut } = useClockOut();

// Reset current gig only
await resetGig();

// Full clock out (ends shift + resets gig)
await clockOut();
```

You can also access them directly from the job context if you prefer:

```tsx
const { resetGig, clockOut } = useJobDraft();
```

Both approaches are supported. The feature hooks are recommended when you want to keep page components decoupled from the full job context.

**Note**: `useCloseout()` also re-exports `clockOut` and `resetGig` for convenience during job completion flows.
3. Cleanly separate the two timers so they can run independently.

---

**Status**: Scaffolded / Prepared for future extraction. Not yet in active use.
