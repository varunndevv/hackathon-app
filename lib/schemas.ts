import { z } from "zod";

// ─── Triage ────────────────────────────────────────────────────────────────

export const TriageSchema = z.object({
    reportId: z.string(),
    category: z.enum([
        "pothole",
        "garbage",
        "broken_light",
        "flooding",
        "water_leak",
        "other",
    ]),
    priority: z.enum(["P1", "P2", "P3", "P4"]),
    reasoning: z.string(),
    suggestedAction: z.string(),
    wardContext: z.string(),
    isDuplicate: z.boolean(),
    existingReportId: z.string().optional(),
    upvoteCount: z.number().optional(),
});

export type TriageResult = z.infer<typeof TriageSchema>;

// ─── Report ────────────────────────────────────────────────────────────────

export const StatusEventSchema = z.object({
    label: z.string(),
    date: z.string(),
    done: z.boolean(),
});

export const ReportSchema = z.object({
    id: z.string(),
    category: z.enum([
        "pothole",
        "garbage",
        "broken_light",
        "flooding",
        "water_leak",
        "other",
    ]),
    priority: z.enum(["P1", "P2", "P3", "P4"]),
    status: z.enum(["open", "assigned", "in_progress", "resolved"]),
    imageUrl: z.string().optional(),
    resolutionPhotoUrl: z.string().optional(),
    upvoteCount: z.number(),
    timeline: z.array(StatusEventSchema),
    resolvedAt: z.string().optional(),
    createdAt: z.string(),
});

export type Report = z.infer<typeof ReportSchema>;
export type StatusEvent = z.infer<typeof StatusEventSchema>;

// ─── Map Report ────────────────────────────────────────────────────────────

export const MapReportSchema = z.object({
    id: z.string(),
    lat: z.number(),
    lng: z.number(),
    category: z.string(),
    priority: z.enum(["P1", "P2", "P3", "P4"]),
    upvoteCount: z.number(),
    status: z.string(),
});

export type MapReport = z.infer<typeof MapReportSchema>;

// ─── Stats ─────────────────────────────────────────────────────────────────

export interface Stats {
    total: number;
    resolvedToday: number;
    avgResolutionHours: number;
    openP1: number;
}

// ─── Admin Report ──────────────────────────────────────────────────────────

export interface AdminReport {
    id: string;
    category: string;
    priority: "P1" | "P2" | "P3" | "P4";
    ward: string;
    upvoteCount: number;
    status: string;
    imageUrl?: string;
    createdAt: string;
}

export interface AdminStats {
    total: number;
    openP1: number;
    resolvedToday: number;
    avgResolutionHours: number;
    duplicateRate: number;
}
