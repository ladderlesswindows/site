import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing Supabase service role key. Add SUPABASE_SERVICE_ROLE_KEY to .env.local (get it from Supabase Dashboard > Project Settings > API > service_role key)')
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST() {
  try {
    // Delete all data (using .neq trick because PostgREST requires a filter for DELETE)
    await supabaseAdmin.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabaseAdmin.from('providers').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    const rlsDropSQL = `-- Copy and run this in Supabase SQL Editor to drop existing RLS policies
DROP POLICY IF EXISTS "Allow public insert for tentative" ON public.bookings;
DROP POLICY IF EXISTS "Allow anon read for availability" ON public.bookings;
DROP POLICY IF EXISTS "Allow anon update (demo)" ON public.bookings;
-- Add any other policies you created (e.g. for providers table) here if needed
-- After running, you can re-apply fresh RLS policies next week.`

    return NextResponse.json({
      success: true,
      message: 'All data deleted from bookings and providers tables.',
      rlsDropSQL,
    })
  } catch (error: any) {
    console.error('Nuclear clean error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
