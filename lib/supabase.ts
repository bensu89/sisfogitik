import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Client-side Supabase client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = createClient(supabaseUrl, supabaseAnonKey) as any

// Browser client for client components
export function createBrowserSupabaseClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Server client for server components and API routes
export function createServerSupabaseClient(cookieStore: {
  get: (name: string) => { value: string } | undefined
  set: (name: string, value: string, options: object) => void
  remove: (name: string, options: object) => void
}) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: object) {
        cookieStore.set(name, value, options)
      },
      remove(name: string, options: object) {
        cookieStore.remove(name, options)
      },
    },
  })
}
