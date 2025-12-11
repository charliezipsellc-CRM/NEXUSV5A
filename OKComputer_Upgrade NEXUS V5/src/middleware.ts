import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const protectedRoutes = [
  '/dashboard',
  '/crm',
  '/dial',
  '/clients',
  '/finance',
  '/tasks',
  '/calendar',
  '/messages',
  '/university',
  '/manager',
  '/founder',
  '/admin'
]

const roleBasedRoutes = {
  '/manager': ['MANAGER', 'AGENCY_OWNER', 'FOUNDER', 'PLATFORM_OWNER'],
  '/founder': ['FOUNDER', 'PLATFORM_OWNER'],
  '/admin': ['PLATFORM_OWNER'],
}

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // Check if route is protected
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))
  
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Check role-based access
  for (const [route, allowedRoles] of Object.entries(roleBasedRoutes)) {
    if (pathname.startsWith(route)) {
      if (!token || !allowedRoles.includes(token.role as string)) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  // Redirect based on user role and status
  if (token && pathname === '/dashboard') {
    const user = token as any
    
    // Recruits should see recruit dashboard until activated
    if (user.role === 'RECRUIT' && user.recruitProfile?.status !== 'ACTIVATED') {
      return NextResponse.redirect(new URL('/recruit', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/crm/:path*',
    '/dial/:path*',
    '/clients/:path*',
    '/finance/:path*',
    '/tasks/:path*',
    '/calendar/:path*',
    '/messages/:path*',
    '/university/:path*',
    '/manager/:path*',
    '/founder/:path*',
    '/admin/:path*',
    '/recruit/:path*',
  ]
}