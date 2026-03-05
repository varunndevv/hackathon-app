import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { checkExistingReports } from '@/lib/dedup'
import { uploadImage } from '@/lib/storage'
import {
  resolveWard,
  checkProximityBoost,
  resolvePriority,
  resolveDepartment,
  getSlaHours,
  queryPageIndex,
} from '@/lib/pageindex'
import { TriageSchema } from '@/lib/schemas'

export const maxDuration = 60 // allow up to 60s for AI call

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const imageFile = formData.get('image') as File | null
    const latStr = formData.get('lat') as string | null
    const lngStr = formData.get('lng') as string | null
    const sessionId = formData.get('sessionId') as string | null

    if (!imageFile) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 })
    }

    const lat = latStr ? parseFloat(latStr) : null
    const lng = lngStr ? parseFloat(lngStr) : null

    // --------------------------------------------------------
    // Step 1: Deduplication check (if coordinates provided)
    // --------------------------------------------------------
    if (lat !== null && lng !== null) {
      const dedupResult = await checkExistingReports(lat, lng)
      if (dedupResult.isDuplicate && dedupResult.existingReportId) {
        // Fetch the existing report for context
        const { data: existingReport } = await supabaseAdmin
          .from('reports')
          .select('*')
          .eq('id', dedupResult.existingReportId)
          .single()

        return NextResponse.json({
          isDuplicate: true,
          existingReportId: dedupResult.existingReportId,
          upvoteCount: dedupResult.newUpvoteCount,
          category: existingReport?.category,
          priority: existingReport?.priority,
          reasoning: existingReport?.reasoning,
          suggestedAction: existingReport?.suggested_action,
          wardContext: existingReport?.ward_context,
          hazardDetected: false,
          department: existingReport?.department_id,
          slaHours: getSlaHours(
            existingReport?.department_id || 'bbmp-general',
            existingReport?.priority || 'P3'
          ),
          reportId: dedupResult.existingReportId,
        })
      }
    }

    // --------------------------------------------------------
    // Step 2: Upload image to Supabase Storage
    // --------------------------------------------------------
    const imageBytes = await imageFile.arrayBuffer()
    const imageBuffer = Buffer.from(imageBytes)
    const imageUrl = await uploadImage(
      imageBuffer,
      imageFile.name,
      imageFile.type
    )

    // --------------------------------------------------------
    // Step 3: PageIndex — get ward context for the AI
    // --------------------------------------------------------
    let wardContextText = ''
    let ward = null
    let proximityBoost = null

    if (lat !== null && lng !== null) {
      wardContextText = queryPageIndex(lat, lng)
      ward = resolveWard(lat, lng)
      proximityBoost = checkProximityBoost(lat, lng)
    }

    // --------------------------------------------------------
    // Step 4: AI Triage with Gemini Flash
    // Convert image to base64 for multimodal input
    // --------------------------------------------------------
    const base64Image = imageBuffer.toString('base64')
    const mimeType = (imageFile.type || 'image/jpeg') as
      | 'image/jpeg'
      | 'image/png'
      | 'image/webp'

    const { object: triageResult } = await generateObject({
      model: google('gemini-2.0-flash'),
      schema: TriageSchema,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              image: `data:${mimeType};base64,${base64Image}`,
            },
            {
              type: 'text',
              text: `You are an AI civic issue triage agent for Bengaluru, India.

Analyze this image and identify the civic infrastructure issue.

${wardContextText ? `CITY CONTEXT (PageIndex):\n${wardContextText}\n\nIMPORTANT: If the PageIndex indicates a priority escalation rule (e.g., near a hospital or school), you MUST follow it and set priority accordingly.` : ''}

Return a structured assessment with:
1. category: The type of issue (pothole, garbage, broken_light, flooding, water_leak, road_damage, sewage_overflow, encroachment, other)
2. severity: Visual severity score 1-5 (1=minor, 5=critical/immediate danger)
3. priority: P1 (Critical, <4hrs), P2 (High, <24hrs), P3 (Medium, <72hrs), P4 (Low, <7 days)
4. reasoning: Clear explanation citing visual evidence and any PageIndex rules applied
5. suggestedAction: Specific action for city authorities
6. wardContext: Summary of the ward/zone context from PageIndex
7. hazardDetected: true if there is an immediate safety risk (deep pothole, exposed wires, sewage overflow near pedestrians, etc.)
8. department: The specific Bengaluru city department that should handle this (e.g., "BBMP Roads Department", "BESCOM", "BWSSB")

Be specific, cite visual evidence, and always follow PageIndex escalation rules.`,
            },
          ],
        },
      ],
    })

    // --------------------------------------------------------
    // Step 5: Override priority with PageIndex rules
    // --------------------------------------------------------
    const finalPriority = resolvePriority(
      ward?.zone || 'residential',
      triageResult.severity,
      triageResult.hazardDetected,
      proximityBoost?.landmark.priority_boost
    ) as 'P1' | 'P2' | 'P3' | 'P4'

    const department = resolveDepartment(triageResult.category)
    const slaHours = getSlaHours(department.id, finalPriority)

    // --------------------------------------------------------
    // Step 6: Save to Supabase
    // --------------------------------------------------------
    const locationValue =
      lat !== null && lng !== null
        ? `SRID=4326;POINT(${lng} ${lat})`
        : null

    const { data: newReport, error: insertError } = await supabaseAdmin
      .from('reports')
      .insert({
        location: locationValue,
        lat,
        lng,
        image_url: imageUrl,
        category: triageResult.category,
        priority: finalPriority,
        severity: triageResult.severity,
        reasoning: triageResult.reasoning,
        suggested_action: triageResult.suggestedAction,
        ward_context: triageResult.wardContext || wardContextText,
        ward_name: ward?.name || null,
        zone_type: ward?.zone || null,
        department_id: department.id,
        status: 'open',
        status_history: [
          { status: 'open', timestamp: new Date().toISOString() },
        ],
        upvote_count: 1,
        is_duplicate: false,
        session_id: sessionId,
      })
      .select()
      .single()

    if (insertError) {
      console.error('[Triage] Insert error:', insertError.message)
      return NextResponse.json(
        { error: 'Failed to save report' },
        { status: 500 }
      )
    }

    // --------------------------------------------------------
    // Step 7: Return structured response
    // --------------------------------------------------------
    return NextResponse.json({
      reportId: newReport.id,
      category: triageResult.category,
      priority: finalPriority,
      severity: triageResult.severity,
      reasoning: triageResult.reasoning,
      suggestedAction: triageResult.suggestedAction,
      wardContext: triageResult.wardContext || wardContextText,
      hazardDetected: triageResult.hazardDetected,
      department: department.name,
      departmentId: department.id,
      departmentPhone: department.phone,
      slaHours,
      isDuplicate: false,
      upvoteCount: 1,
      imageUrl,
    })
  } catch (err) {
    console.error('[Triage] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error during triage' },
      { status: 500 }
    )
  }
}
