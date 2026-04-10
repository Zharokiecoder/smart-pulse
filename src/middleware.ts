import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey || !supabaseUrl.startsWith('https://')) {
        return NextResponse.next();
    }

    try {
        let supabaseResponse = NextResponse.next({ request })

        const supabase = createServerClient(supabaseUrl, supabaseKey, {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        })

        const { data: { user } } = await supabase.auth.getUser()

        const publicPaths = ['/login', '/register', '/auth/callback', '/onboarding']
        const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))

        if (!user && !isPublicPath && request.nextUrl.pathname !== '/') {
            const redirectUrl = request.nextUrl.clone()
            redirectUrl.pathname = '/login'
            return NextResponse.redirect(redirectUrl)
        }

        if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
            const redirectUrl = request.nextUrl.clone()
            redirectUrl.pathname = '/dashboard'
            return NextResponse.redirect(redirectUrl)
        }

        return supabaseResponse
    } catch {
        // If Supabase is unreachable, allow the request through
        return NextResponse.next()
    }
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
