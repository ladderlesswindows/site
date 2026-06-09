import fs from 'fs';
import path from 'path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { ensureProjectEnvLoaded, serverEnv } from './lib/serverEnv';
import { PROVIDER_ID } from './lib/bookingConstants';

const ICS_FILENAME = 'simplewindowcleaning@gmail.com.ics';

function getImportClient(): SupabaseClient {
  ensureProjectEnvLoaded();
  const url = serverEnv('NEXT_PUBLIC_SUPABASE_URL');
  const serviceRoleKey = serverEnv('SUPABASE_SERVICE_ROLE_KEY');
  const anonKey = serverEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (url && serviceRoleKey) {
    return createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  if (url && anonKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY missing — falling back to anon key (RLS may block inserts).');
    return createClient(url, anonKey);
  }

  throw new Error('Supabase env missing. Add credentials to repo-root .env.local');
}

function parseIcsDate(dt: string): Date {
  const clean = dt.replace(/Z$/, '');
  const y = clean.slice(0, 4);
  const mo = clean.slice(4, 6);
  const d = clean.slice(6, 8);
  const h = clean.slice(9, 11) || '00';
  const mi = clean.slice(11, 13) || '00';
  const s = clean.slice(13, 15) || '00';
  return new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}`);
}

function parseEvents(content: string) {
  const events: { start: string; end: string; summary: string }[] = [];
  const regex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const block = match[1];
    const lines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    let dtstart = '';
    let dtend = '';
    let summary = 'Personal Time';
    let currentKey = '';
    for (const line of lines) {
      if (line.startsWith(' ')) {
        if (currentKey === 'DTSTART') dtstart += line.trim();
        else if (currentKey === 'DTEND') dtend += line.trim();
        else if (currentKey === 'SUMMARY') summary += line.trim();
        continue;
      }
      const colon = line.indexOf(':');
      if (colon === -1) continue;
      let key = line.substring(0, colon);
      const val = line.substring(colon + 1);
      if (key.includes(';')) key = key.split(';')[0];
      if (key === 'DTSTART') {
        dtstart = val;
        currentKey = 'DTSTART';
      } else if (key === 'DTEND') {
        dtend = val;
        currentKey = 'DTEND';
      } else if (key === 'SUMMARY') {
        summary = val;
        currentKey = 'SUMMARY';
      } else {
        currentKey = '';
      }
    }
    if (dtstart && dtend) {
      events.push({ start: dtstart, end: dtend, summary });
    }
  }
  return events;
}

async function ensureProvider(supabase: SupabaseClient) {
  const { data: existing } = await supabase
    .from('providers')
    .select('id')
    .eq('id', PROVIDER_ID)
    .maybeSingle();

  if (existing) return;

  const { error } = await supabase.from('providers').insert({
    id: PROVIDER_ID,
    full_name: 'Ladderless Provider',
    email: 'simplewindowcleaning@gmail.com',
    role: 'owner',
  });

  if (error) {
    throw new Error(`Could not seed provider row (${PROVIDER_ID}): ${error.message}`);
  }

  console.log(`Seeded provider row ${PROVIDER_ID}`);
}

async function main() {
  const icsPath = path.join(process.cwd(), 'assets', 'calendar', ICS_FILENAME);
  if (!fs.existsSync(icsPath)) {
    console.error('ICS file not found at', icsPath);
    console.error('Export from Apple Calendar, then place the file at landing/assets/calendar/.');
    process.exit(1);
  }

  const supabase = getImportClient();
  await ensureProvider(supabase);
  const content = fs.readFileSync(icsPath, 'utf8');
  const events = parseEvents(content);
  console.log(`Parsed ${events.length} events from ICS.`);

  const now = new Date();
  let inserted = 0;
  let skipped = 0;

  for (const ev of events) {
    const start = parseIcsDate(ev.start);
    const end = parseIcsDate(ev.end);
    if (end.getTime() < now.getTime() - 86400000) continue;

    const duration = Math.max(15, Math.round((end.getTime() - start.getTime()) / 60000));
    const label = ev.summary.trim() || 'Blocked';

    const { data: existing } = await supabase
      .from('bookings')
      .select('id')
      .eq('provider_id', PROVIDER_ID)
      .eq('status', 'blocked')
      .gte('scheduled_start', new Date(start.getTime() - 3600000).toISOString())
      .lte('scheduled_start', new Date(end.getTime() + 3600000).toISOString())
      .limit(1);

    if (existing && existing.length > 0) {
      skipped++;
      continue;
    }

    const { error: insertError } = await supabase.from('bookings').insert({
      provider_id: PROVIDER_ID,
      customer_name: label,
      scheduled_start: start.toISOString(),
      duration_minutes: duration,
      status: 'blocked',
    });

    if (insertError) {
      console.error(`Error inserting blocked "${label}": ${insertError.message}`);
      continue;
    }

    console.log(`Blocked: ${label} @ ${start.toISOString().slice(0, 16)} (${duration} min)`);
    inserted++;
  }

  console.log(`Done. Inserted ${inserted} new blocked slots. Skipped ${skipped} duplicates/old.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});