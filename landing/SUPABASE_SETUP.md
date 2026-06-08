# Supabase Setup Reference (Ladderless Windows)

The 30-second booking flow is wired to Supabase for real availability and 15-minute tentative holds.

## Required env (repo-root `.env.local`)

The Next app lives in `landing/` but loads env from the **repository root** (see `landing/next.config.ts`). For local dev you can also symlink: `landing/.env.local` → `../.env.local`.
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
NEXT_PUBLIC_PROVIDER_ID=your-provider-uuid

## Core tables + policies (run once in SQL Editor)
```sql
-- providers
create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  email text,
  role text default 'owner',
  created_at timestamptz default now()
);

-- bookings (used by customer 30s flow)
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references public.providers(id),
  customer_name text not null,
  customer_email text,
  customer_phone text,
  zip_code text,
  address text,
  window_count int,
  estimated_price numeric,
  scheduled_start timestamptz,
  duration_minutes int default 60,
  status text default 'tentative',
  qualifier_code text,
  arrival_notes text,
  goals text,
  expires_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_bookings_provider_status_start 
  on public.bookings(provider_id, status, scheduled_start);

alter table public.bookings enable row level security;

-- anon can create tentative holds (customer flow)
create policy "Allow public insert for tentative"
  on public.bookings for insert to anon
  with check (status = 'tentative');

-- anon read for availability (slot picker)
create policy "Allow anon read for availability"
  on public.bookings for select to anon
  using (true);

-- demo: allow updates from browser admin stub (tighten with auth later)
create policy "Allow anon update (demo)"
  on public.bookings for update to anon
  using (true) with check (true);
```

Insert one provider row and copy its id into NEXT_PUBLIC_PROVIDER_ID.

## Client
lib/supabase.ts uses the anon key for browser queries/inserts. The slot page falls back gracefully if env is missing.

See app/booking/slot/page.tsx and app/admin/bookings/page.tsx for usage.

Keep policies minimal. Use the provider-app for real worker auth later.
