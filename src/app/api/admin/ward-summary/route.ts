import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/admin/ward-summary — AI-generated ward hotspot analysis
export async function GET(req: NextRequest) {
  const adminAuth = req.cookies.get('admin_auth')?.value
  if (adminAuth !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get recent reports grouped by ward
  const { data: reports } = await supabaseAdmin
    .from('reports')
    .select('ward_name, priority, category, status, created_at')
    .gte(
      'created_at',
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    )
    .order('created_at', { ascending: false })
    .limit(200)

  if (!reports || reports.length === 0) {
    return NextResponse.json({
      summary: 'No report data available for the past 7 days.',
    })
  }

  // Aggregate by ward
  const wardStats: Record<
    string,
    { total: number; p1: number; categories: Record<string, number> }
  > = {}

  for (const r of reports) {
    const ward = r.ward_name || 'Unknown'
    if (!wardStats[ward]) {
      wardStats[ward] = { total: 0, p1: 0, categories: {} }
    }
    wardStats[ward].total++
    if (r.priority === 'P1') wardStats[ward].p1++
    wardStats[ward].categories[r.category] =
      (wardStats[ward].categories[r.category] || 0) + 1
  }

  const statsText = Object.entries(wardStats)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5)
    .map(
      ([ward, stats]) =>
        `${ward}: ${stats.total} reports (${stats.p1} P1), top issue: ${Object.entries(stats.categories).sort((a, b) => b[1] - a[1])[0]?.[0]}`
    )
    .join('\n')

  const { text } = await generateText({
    model: google('gemini-2.0-flash'),
    prompt: `You are a city operations AI for Bengaluru. Analyze this 7-day ward report data and provide a concise 3-4 sentence operational briefing:

${statsText}

Highlight: Which wards need immediate attention, what the dominant issue types are, and any recommended resource allocation. Be specific and actionable.`,
  })

  return NextResponse.json({ summary: text, wardStats })
}
