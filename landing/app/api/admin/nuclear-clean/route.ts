import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { serverEnv } from '@/lib/serverEnv';

const ADMIN_PASSWORD = 'shark';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const password = typeof body.password === 'string' ? body.password : '';
    const confirmation = typeof body.confirmation === 'string' ? body.confirmation : '';

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Incorrect admin password.' }, { status: 401 });
    }

    if (confirmation !== 'NUCLEAR') {
      return NextResponse.json({ error: 'Nuclear clean not confirmed.' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      const hasUrl = Boolean(serverEnv('NEXT_PUBLIC_SUPABASE_URL'));
      const hasKey = Boolean(serverEnv('SUPABASE_SERVICE_ROLE_KEY'));
      const vercelEnv = process.env.VERCEL_ENV;
      return NextResponse.json(
        {
          error: hasUrl && !hasKey
            ? 'Missing Supabase service role key. Local: add SUPABASE_SERVICE_ROLE_KEY to repo-root .env.local. Vercel: Project → Settings → Environment Variables → add SUPABASE_SERVICE_ROLE_KEY (Supabase Dashboard → API → service_role), enable Production and Preview, then redeploy.'
            : 'Supabase admin client is not configured.',
          vercelEnv: vercelEnv ?? null,
          hint:
            hasUrl && !hasKey && vercelEnv
              ? `Running on Vercel (${vercelEnv}). The service role key must be set in the Vercel dashboard for this environment — .env.local is not deployed.`
              : undefined,
        },
        { status: 500 }
      );
    }

    await supabaseAdmin.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('providers').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const rlsDropSQL = `-- Copy and run this in Supabase SQL Editor to drop existing RLS policies
DROP POLICY IF EXISTS "Allow public insert for tentative" ON public.bookings;
DROP POLICY IF EXISTS "Allow anon read for availability" ON public.bookings;
DROP POLICY IF EXISTS "Allow anon update (demo)" ON public.bookings;
-- Add any other policies you created (e.g. for providers table) here if needed
-- After running, you can re-apply fresh RLS policies next week.`;

    return NextResponse.json({
      success: true,
      message: 'All data deleted from bookings and providers tables.',
      rlsDropSQL,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Nuclear clean error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}