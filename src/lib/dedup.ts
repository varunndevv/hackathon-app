import { supabaseAdmin } from './supabase'

// ============================================================
// Deduplication Service
// Checks for any existing open report within 15m radius
// Uses PostGIS ST_Distance via Supabase RPC
// ============================================================

interface NearbyReport {
  id: string
  upvote_count: number
  priority: string
  status: string
  community_ticket_id: string | null
  distance_meters: number
}

export interface DedupResult {
  isDuplicate: boolean
  existingReportId?: string
  newUpvoteCount?: number
}

export async function checkExistingReports(
  lat: number,
  lng: number
): Promise<DedupResult> {
  try {
    const { data, error } = await supabaseAdmin.rpc('find_nearby_reports', {
      p_lat: lat,
      p_lng: lng,
      p_radius_meters: 15,
    })

    if (error) {
      console.error('[Dedup] PostGIS error:', error.message)
      return { isDuplicate: false }
    }

    if (!data || data.length === 0) {
      return { isDuplicate: false }
    }

    const nearby = data[0] as NearbyReport

    // Increment the upvote count on the existing report
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('reports')
      .update({ upvote_count: nearby.upvote_count + 1 })
      .eq('id', nearby.id)
      .select('upvote_count')
      .single()

    if (updateError) {
      console.error('[Dedup] Upvote error:', updateError.message)
    }

    return {
      isDuplicate: true,
      existingReportId: nearby.id,
      newUpvoteCount: updated?.upvote_count ?? nearby.upvote_count + 1,
    }
  } catch (err) {
    console.error('[Dedup] Unexpected error:', err)
    return { isDuplicate: false }
  }
}
