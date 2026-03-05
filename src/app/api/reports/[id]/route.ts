import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { StatusUpdateSchema, FeedbackSchema } from '@/lib/schemas'

// GET /api/reports/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { data, error } = await supabaseAdmin
    .from('reports')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

// PATCH /api/reports/[id] — admin status update
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Admin auth check
  const adminAuth = req.cookies.get('admin_auth')?.value
  if (adminAuth !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = StatusUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const { status, note, resolutionPhotoUrl } = parsed.data

  // Get current report for history
  const { data: current } = await supabaseAdmin
    .from('reports')
    .select('status_history')
    .eq('id', id)
    .single()

  const newHistory = [
    ...(current?.status_history || []),
    {
      status,
      timestamp: new Date().toISOString(),
      note: note || null,
    },
  ]

  const updatePayload: Record<string, unknown> = {
    status,
    status_history: newHistory,
  }

  if (status === 'resolved') {
    updatePayload.resolved_at = new Date().toISOString()
    if (resolutionPhotoUrl) {
      updatePayload.resolution_photo_url = resolutionPhotoUrl
    }
  }

  const { data, error } = await supabaseAdmin
    .from('reports')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
