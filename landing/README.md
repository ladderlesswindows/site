# Ladderless Landing

Marketing site for Ladderless Windows premium no-ladder window cleaning service.

## Coverage Module (swappable)

The coverage module is deliberately isolated so you can run this for different territories.

- ZIP checker + live switching between themed per-ZIP maps + overview/not-covered states.
- Full/partial distinction + per-ZIP explanations driven 100% by data.
- Quick ZIP buttons (derived from registry) + "email" contact button (desktop only).
- "Check different ZIP" reset in success/denial states.
- Links to siloed 30s booking flow (`/booking?zip=...&windows=...`).
- Phone-shaped (max-w-md), Japanese-minimal, two-frame aesthetic (branding frame above, coverage content below).

## Swapping for another location (e.g. Gilroy)

To leave one person running Santa Cruz and go run Gilroy (or any other), **just change the coverage module**:

1. Edit `components/zipRegistry.ts`:
   - Replace the `zipRegistry` array with the new territory's zips (city, full/partial, explanations for partials).
   - Update the `coverage` meta object (name, defaultMapAlt, contactEmail if different).
2. Add/replace images in `public/`:
   - `coverage-map.png` (the default overview map shown with no zip selected for this territory)
   - One `{zip}-map.jpg` for every zip listed in the new registry (use the same visual theme as existing ones)
   - `templatenotcovered.jpg` is shared/generic.
3. (Optional) Update any location-specific fine print if needed, but the success fine-print box and qualifier text are intentionally generic.

The rest of the app is generic:
- `app/page.tsx` just renders the shared branding chrome (logo + "How?" video) + `<CoverageModule />` + trust/footer + video modal.
- Siloed flows at `app/booking/page.tsx` and `app/location/page.tsx` receive zip/windows via URL params, duplicate the minimal branding header for visual seamlessness, carry the `/${zip}-map.jpg`, and implement the qualifier + address stub. No coverage data import.
- Price is currently demo $20/window (easy to adjust in the three spots if you want per-territory pricing later).

This keeps the monolith minimal while making territory swaps trivial (data + 1-10 image files).

## Current structure

- `app/page.tsx`: Thin host (branding frame + CoverageModule + shared bits).
- `components/CoverageModule.tsx`: The coverage UI (quick buttons, map switcher, ZipChecker wrapper). This + zipRegistry + images = what you swap.
- `components/ZipChecker.tsx`: Input + full/partial/denial states + window count + "Start 30 Second Booking" link + fine print.
- `components/zipRegistry.ts`: The data (plus coverage meta). Change this for a new market.
- `app/booking/page.tsx`, `app/location/page.tsx`: Fully siloed next steps (carry map + params, duplicate only the logo frame for continuity).
- Themed maps in `public/`.

## Development

```bash
npm install
npm run dev
```

Built with least code possible. Coverage is isolated for easy moves to new markets. The 30s booking flow uses Supabase for live data.

## Current status
The direct 30-second booking path is live and wired to Supabase for real-time availability and tentative slot holds.

The coverage module remains fully swappable for new territories (data + maps only).
