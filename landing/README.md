# Ladderless Landing

Marketing site and 30-second booking flow for Ladderless Windows.

## Active routes

| Path | Purpose |
|------|---------|
| `/` | Home — ZIP checker, preview schedule, start booking |
| `/booking` | Qualifier + screens modal |
| `/booking/address` | Live schedule, address, goals, reserve |
| `/booking/success` | Confirmation |
| `/booking/mom/*` | Mom easter egg (ZIP 79510) — same flow, separate path |
| `/explain` | About detour → continues to `/booking/address` |
| `/booking/post-job` | Post-job tip/review (linked from completion emails) |
| `/admin/bookings` | Admin calendar (password: shark) |

Legacy redirects: `/book` → `/booking`, `/booking/slot` → `/booking/address`, `/location` → `/booking`.

## Coverage module (swappable)

To run the site in a new territory, edit `components/zipRegistry.ts` — ZIP list, partial/full coverage, minimum windows, and `coverage.contactEmail`. Everything else stays generic.

## Development

```bash
npm install
npm run dev
```

Env lives in repo-root `.env.local` (loaded by `next.config.ts`). See `SUPABASE_SETUP.md`.

### Personal calendar import

After nuclear clean, seed blocked slots from Apple Calendar:

```bash
npm run import:personal-calendar
```

Place the exported ICS at `landing/assets/calendar/simplewindowcleaning@gmail.com.ics`.

## Structure

- `app/page.tsx` — home (branding + `CoverageModule`)
- `components/ZipChecker.tsx` — ZIP input, success state, preview schedule
- `components/BookingFlowContent.tsx` — `/booking` step
- `components/BookingAddressFlowContent.tsx` — address + live schedule
- `components/BookingPreviewLayout.tsx` — three-panel layout (schedule, main, prices)
- `components/FlowPageLayout.tsx` — shared row layout wrapper
- `hooks/useSupabase.ts` — browser Supabase client (build env or `/api/supabase-config`)
- `lib/bookingSlots.ts` — slot generation, overlap blocking, reservation
- `proxy.ts` — Mom easter egg redirect for `/booking?zip=79510`