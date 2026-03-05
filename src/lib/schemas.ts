import { z } from 'zod'

// ============================================================
// Triage Schema — AI output from Gemini Flash
// Shared between API route and frontend via this file
// ============================================================

export const CategoryEnum = z.enum([
  'pothole',
  'garbage',
  'broken_light',
  'flooding',
  'water_leak',
  'road_damage',
  'sewage_overflow',
  'encroachment',
  'other',
])

export const PriorityEnum = z.enum(['P1', 'P2', 'P3', 'P4'])

export const StatusEnum = z.enum([
  'open',
  'assigned',
  'in_progress',
  'resolved',
])

export const TriageSchema = z.object({
  category: CategoryEnum,
  priority: PriorityEnum,
  severity: z.number().int().min(1).max(5),
  reasoning: z.string().describe('Detailed AI reasoning for the priority assigned'),
  suggestedAction: z.string().describe('Recommended action for city authorities'),
  wardContext: z.string().optional().describe('Ward/zone context from PageIndex'),
  hazardDetected: z.boolean().describe('True if immediate safety hazard is visible'),
  department: z.string().describe('Recommended city department to handle this'),
})

export type TriageResult = z.infer<typeof TriageSchema>

// ============================================================
// Report Schema — database row shape
// ============================================================

export const ReportSchema = z.object({
  id: z.string().uuid(),
  location: z.object({ lat: z.number(), lng: z.number() }).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  image_url: z.string().nullable(),
  category: CategoryEnum,
  priority: PriorityEnum,
  severity: z.number().int().min(1).max(5).optional(),
  reasoning: z.string().nullable(),
  suggested_action: z.string().nullable(),
  ward_context: z.string().nullable(),
  ward_name: z.string().nullable(),
  zone_type: z.string().nullable(),
  department_id: z.string().nullable(),
  status: StatusEnum,
  status_history: z.array(
    z.object({
      status: StatusEnum,
      timestamp: z.string(),
      note: z.string().optional(),
    })
  ),
  upvote_count: z.number().int(),
  community_ticket_id: z.string().uuid().nullable(),
  is_duplicate: z.boolean(),
  resolution_photo_url: z.string().nullable(),
  resolved_at: z.string().nullable(),
  session_id: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type Report = z.infer<typeof ReportSchema>

// ============================================================
// Upload Response Schema
// ============================================================
export const UploadResponseSchema = z.object({
  reportId: z.string().uuid(),
  category: CategoryEnum,
  priority: PriorityEnum,
  severity: z.number().int().min(1).max(5),
  reasoning: z.string(),
  suggestedAction: z.string(),
  wardContext: z.string().optional(),
  hazardDetected: z.boolean(),
  department: z.string(),
  isDuplicate: z.boolean(),
  existingReportId: z.string().uuid().optional(),
  upvoteCount: z.number().int(),
  slaHours: z.number(),
})

export type UploadResponse = z.infer<typeof UploadResponseSchema>

// ============================================================
// Feedback Schema
// ============================================================
export const FeedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
})

export type FeedbackInput = z.infer<typeof FeedbackSchema>

// ============================================================
// Admin status update schema
// ============================================================
export const StatusUpdateSchema = z.object({
  status: StatusEnum,
  note: z.string().optional(),
  resolutionPhotoUrl: z.string().url().optional(),
})

export type StatusUpdate = z.infer<typeof StatusUpdateSchema>

// ============================================================
// Stats Schema
// ============================================================
export const StatsSchema = z.object({
  total: z.number(),
  resolvedToday: z.number(),
  avgResolutionHours: z.number(),
  openP1: z.number(),
  duplicateRate: z.number(),
})

export type Stats = z.infer<typeof StatsSchema>
