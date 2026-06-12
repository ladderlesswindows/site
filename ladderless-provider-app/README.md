# Ladderless Provider

Mobile app for window and screen cleaning professionals to document jobs on-site.

Built with **Expo SDK 54** (React Native), using file-based routing, local SQLite storage, camera capture, and spreadsheet export — no backend required.

## Features

- **Safety Action Plan** at clock-in (3 required checkboxes: Client Nearby, Smartwatch Charged, Assistant on site)
- **Address + Miles Driven** entry before starting work
- **Walls documentation** — up to 20 walls, each with photo + window/screen counts
- **Screens before/after** photos with dedicated capture flow
- **Final photos** (up to 4) + notes
- **Dual time tracking**: Engaged time (from Clock In) + Working/Gig time (from Begin Gig)
- **Live stopwatch** while on the job
- **Previous Jobs** list with full detail view (all photos, times, safety checks, counts)
- **Spreadsheet export** (.xlsx) with exact columns for bookkeeping:
  - Job clock-in time, Address, Begin Gig time
  - Walls / Windows / Screens totals
  - Engaged duration (min), Gig duration (min)
  - Miles driven, Safety Action Plan checks
- Dark mode by default with banner images + theme toggle
- Fully offline — all data stored locally in SQLite

## Tech Stack

- Expo SDK 54 + Expo Router v6
- NativeWind v5 (Tailwind for React Native)
- expo-sqlite, expo-camera, expo-file-system, expo-sharing
- xlsx for spreadsheet generation
- lucide-react-native icons

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI / Expo Go app on your phone
- iOS Simulator or Android Emulator (optional)

### Install & Run

```bash
# Install dependencies
npm install

# Start the dev server (clear cache on first run)
npx expo start -c
```

Scan the QR code with Expo Go, or press `i` / `a` for simulator.

### First Time Setup Notes

- The app creates its own SQLite database on first launch.
- All photos are stored permanently inside the app's documents directory (organized by job ID).
- No login or cloud sync is required — this is a local-first tool.

## Project Structure

```
app/                    # Expo Router screens
  new-job/              # Job workflow (walls → screens → final)
  previous-jobs/        # History + detail view
lib/
  job-draft-context.tsx # Main state + SQLite logic
  export-to-spreadsheet.ts
  photo-storage.ts
  theme-context.tsx
components/             # Reusable UI (BigButton, NumberInput, etc.)
assets/                 # banner_dark.jpg, banner_light.jpg, LL.jpg, icons
```

## Important Files

- `app/clock-in.tsx` — Safety Action Plan + Clock In
- `app/home.tsx` — Address + Miles entry + Begin Gig
- `app/new-job/walls.tsx` — Core wall capture flow
- `lib/job-draft-context.tsx` — The heart of the app (draft lifecycle, DB writes)
- `lib/export-to-spreadsheet.ts` — .xlsx generation with exact column order

## Data & Export

Jobs are saved locally. Use the **Export to Spreadsheet** button on the job summary or previous job detail screen. The generated `.xlsx` has three sheets:
1. Job Summary (main bookkeeping row)
2. Walls (per-wall breakdown)
3. Final Photos (list of final photos taken)

## Future / Planned

- Separate drive time tracking (using miles)
- GPS-based mileage (optional)
- Search / filter previous jobs
- Delete jobs
- Optional cloud sync (Supabase or similar)

## Notes for Developers / AI Agents

See `AGENTS.md` for coding guidelines (especially around Expo SDK 54 and expo-router patterns).

This project was built iteratively with very specific UI and data flow requirements from the end user (a professional cleaner). Many decisions (button ordering, when fields appear, exact spreadsheet columns, dual timers, etc.) are intentional even if they look non-standard.

## License

Private project.

---

Built for real work, not demos. Gloves-friendly buttons and offline reliability are first-class concerns.
