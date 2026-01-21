import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Only apply middleware to /mobile routes
  if (!request.nextUrl.pathname.startsWith('/mobile')) {
    return NextResponse.next()
  }

  // Allow login and auth callback routes without authentication
  if (
    request.nextUrl.pathname === '/mobile/login' ||
    request.nextUrl.pathname.startsWith('/mobile/auth')
  ) {
    return NextResponse.next()
  }

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // Supabase not configured - redirect to login with setup message
    const url = request.nextUrl.clone()
    url.pathname = '/mobile/login'
    return NextResponse.redirect(url)
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  try {
    // Refresh session if expired
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If no user and trying to access protected mobile routes, redirect to login
    if (!user && request.nextUrl.pathname.startsWith('/mobile')) {
      const url = request.nextUrl.clone()
      url.pathname = '/mobile/login'
      return NextResponse.redirect(url)
    }
  } catch {
    // Auth check failed - redirect to login
    const url = request.nextUrl.clone()
    url.pathname = '/mobile/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (they handle their own auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
  ],
}
