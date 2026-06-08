import fs from 'fs';
import path from 'path';
import { supabase } from './lib/supabase';

const PROVIDER_ID = 'cc79bb27-5b21-4c56-aaae-7da80d38fa9f';

function parseIcsDate(dt: string): Date {
  // dt like 20230322T123000 (ignores TZID for minimal impl; treats as local time of runner)
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

async function main() {
  const icsPath = path.join(process.cwd(), 'ladderless-provider-app', 'assets', 'simplewindowcleaning@gmail.com.ics');
  if (!fs.existsSync(icsPath)) {
    console.error('ICS file not found at', icsPath);
    process.exit(1);
  }
  const content = fs.readFileSync(icsPath, 'utf8');
  const events = parseEvents(content);
  console.log(`Parsed ${events.length} events from ICS.`);

  const now = new Date();
  let inserted = 0;
  let skipped = 0;

  for (const ev of events) {
    const start = parseIcsDate(ev.start);
    const end = parseIcsDate(ev.end);
    if (end.getTime() < now.getTime() - 86400000) continue; // skip old events

    const duration = Math.max(15, Math.round((end.getTime() - start.getTime()) / 60000));

    // Simple overlap check for existing blocked around this time (to avoid dups on re-runs)
    const { data: existing } = await (supabase!)
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

    // Insert as 'tentative' first (satisfies RLS "tentative only" insert policy for anon),
    // then immediately update status to 'blocked'.
    const { data: insertedRow, error: insertError } = await (supabase!).from('bookings').insert({
      provider_id: PROVIDER_ID,
      customer_name: 'Blocked - Personal',
      scheduled_start: start.toISOString(),
      duration_minutes: duration,
      status: 'tentative',
    }).select().single();

    if (insertError || !insertedRow) {
      console.error(`Error inserting tentative for "${ev.summary}": ${insertError?.message}`);
      continue;
    }

    const { error: updateError } = await (supabase!)
      .from('bookings')
      .update({ status: 'blocked' })
      .eq('id', insertedRow.id);

    if (updateError) {
      console.error(`Error updating to blocked for "${ev.summary}": ${updateError.message}`);
    } else {
      console.log(`Blocked: ${ev.summary} @ ${start.toISOString().slice(0, 16)} (${duration} min)`);
      inserted++;
    }
  }

  console.log(`Done. Inserted ${inserted} new blocked slots. Skipped ${skipped} duplicates/old.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
