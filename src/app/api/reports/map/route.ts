import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/reports/map — returns lightweight pin data for map rendering
export async function GET(_req: NextRequest) {
  const { data, error } = await supabaseAdmin
    .from('reports')
    .select(
      'id, lat, lng, category, priority, status, upvote_count, ward_name, created_at'
    )
    .neq('status', 'resolved')
    .not('lat', 'is', null)
    .not('lng', 'is', null)
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ pins: data })
}
