import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const res = NextResponse.next()

    try {
        const supabase = createMiddlewareClient({ req: request, res })
        await supabase.auth.getSession()
    } catch (error) {
        console.error('Middleware error:', error)
    }

    return res
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}