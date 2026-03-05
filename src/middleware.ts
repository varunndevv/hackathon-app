import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect /admin routes (except /admin/login itself)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminAuth = req.cookies.get('admin_auth')?.value
    if (adminAuth !== 'true') {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  // Protect /api/admin routes
  if (pathname.startsWith('/api/admin') && pathname !== '/api/admin/auth') {
    const adminAuth = req.cookies.get('admin_auth')?.value
    if (adminAuth !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
