import { createBrowserClient } from '@supabase/ssr'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const isConfigured = url && key && url !== 'your-supabase-url-here'

// Module-level singleton — created once, reused everywhere.
// This prevents multiple auth lock acquisitions that cause
// "Lock broken by another request with the 'steal' option" errors.
export const supabase = createBrowserClient(
    isConfigured ? url : 'https://placeholder.supabase.co',
    isConfigured ? key : 'placeholder-key'
)

// Keep createClient for backward compat — always returns the same instance
export function createClient() {
    return supabase
}
