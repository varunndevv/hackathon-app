import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/stats — public stats for landing page and dashboards
export async function GET(_req: NextRequest) {
  try {
    // Total reports
    const { count: total } = await supabaseAdmin
      .from('reports')
      .select('*', { count: 'exact', head: true })

    // Resolved today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const { count: resolvedToday } = await supabaseAdmin
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'resolved')
      .gte('resolved_at', todayStart.toISOString())

    // Open P1 issues
    const { count: openP1 } = await supabaseAdmin
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('priority', 'P1')
      .neq('status', 'resolved')

    // Duplicate count for rate calculation
    const { count: duplicates } = await supabaseAdmin
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('is_duplicate', true)

    // Avg resolution time (hours) from resolved reports
    const { data: resolved } = await supabaseAdmin
      .from('reports')
      .select('created_at, resolved_at')
      .eq('status', 'resolved')
      .not('resolved_at', 'is', null)
      .limit(100)

    let avgResolutionHours = 0
    if (resolved && resolved.length > 0) {
      const totalHours = resolved.reduce((sum, r) => {
        const created = new Date(r.created_at).getTime()
        const resolvedAt = new Date(r.resolved_at!).getTime()
        return sum + (resolvedAt - created) / (1000 * 60 * 60)
      }, 0)
      avgResolutionHours = Math.round(totalHours / resolved.length)
    }

    const duplicateRate =
      total && total > 0
        ? Math.round(((duplicates || 0) / total) * 100)
        : 0

    return NextResponse.json({
      total: total || 0,
      resolvedToday: resolvedToday || 0,
      avgResolutionHours,
      openP1: openP1 || 0,
      duplicateRate,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
