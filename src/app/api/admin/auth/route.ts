import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'civicsync-admin-2024'

// POST /api/admin/auth — verify admin password and set cookie
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { password } = body

  if (!password || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })

  // Set httpOnly cookie for 24 hours
  response.cookies.set('admin_auth', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })

  return response
}

// DELETE /api/admin/auth — logout
export async function DELETE(_req: NextRequest) {
  const response = NextResponse.json({ success: true })
  response.cookies.set('admin_auth', '', { maxAge: 0, path: '/' })
  return response
}
