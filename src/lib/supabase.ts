import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  const missing = [
    !supabaseUrl && 'VITE_SUPABASE_URL',
    !supabaseAnonKey && 'VITE_SUPABASE_ANON_KEY',
  ].filter(Boolean)
  throw new Error(
    `Missing Supabase environment variables: ${missing.join(', ')}. ` +
    `Add them to .env or .env.local in the project root (use VITE_ prefix), then restart the dev server.`
  )
}

// Official Supabase pattern - production ready with security config
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // For magic links and email confirmations
    // Session configuration for 30-day persistence
    flowType: 'implicit', // Use implicit flow instead of PKCE for better compatibility
    debug: false, // Set to true for debugging auth issues
  }
})
