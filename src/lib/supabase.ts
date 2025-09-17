import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Browser client for SSR
export function createClientComponentClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

