import { createBrowserClient } from '@supabase/ssr'

let cachedClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key || url === 'your-supabase-url-here') {
        // During build or when env vars aren't configured, return a dummy
        // This prevents build-time crashes
        return createBrowserClient(
            'https://placeholder.supabase.co',
            'placeholder-key'
        )
    }

    if (!cachedClient) {
        cachedClient = createBrowserClient(url, key)
    }
    return cachedClient
}
