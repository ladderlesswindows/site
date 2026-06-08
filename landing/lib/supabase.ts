import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

let supabase: SupabaseClient | null = null

if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.warn(
    '⚠️ Supabase env vars are missing (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).\n' +
    'The calendar will show a setup message until you configure them.\n' +
    'See SUPABASE_SETUP.md for instructions.'
  )
}

export { supabase }
