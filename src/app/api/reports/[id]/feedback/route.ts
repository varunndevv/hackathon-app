import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { FeedbackSchema } from '@/lib/schemas'

// POST /api/reports/[id]/feedback
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const parsed = FeedbackSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  // Verify report exists and is resolved
  const { data: report } = await supabaseAdmin
    .from('reports')
    .select('status')
    .eq('id', id)
    .single()

  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  }

  const { data, error } = await supabaseAdmin
    .from('feedback')
    .insert({
      report_id: id,
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
