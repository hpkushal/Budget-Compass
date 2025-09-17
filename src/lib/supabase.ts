import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

// Get environment variables with validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables in browser
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  console.error('❌ Missing Supabase environment variables!')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing')
  throw new Error('Missing required Supabase environment variables. Please check your .env.local file.')
}

// Use fallbacks only for build time (when window is undefined)
const finalUrl = supabaseUrl || 'https://placeholder.supabase.co'
const finalKey = supabaseAnonKey || 'placeholder-key'

// Client-side Supabase client
export const supabase = createClient<Database>(finalUrl, finalKey)

// Browser client for SSR
export function createClientComponentClient() {
  return createBrowserClient<Database>(finalUrl, finalKey)
}

