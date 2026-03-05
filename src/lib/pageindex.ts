import wardsData from '../../knowledge/wards.json'

// ============================================================
// PageIndex — Vectorless RAG for Bengaluru city rules
// Loads from knowledge/wards.json — no vector DB needed
// ============================================================

interface Landmark {
  name: string
  type: string
  priority_boost: string
  lat: number
  lng: number
}

interface Ward {
  id: number
  name: string
  ward_no: string
  zone: string
  center_lat: number
  center_lon: number
  landmarks: Landmark[]
}

interface Department {
  id: string
  name: string
  issues: string[]
  sla: Record<string, number>
  phone: string
  email: string
}

// ============================================================
// Haversine distance in meters between two lat/lng points
// ============================================================
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000 // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ============================================================
// Find nearest ward to a lat/lng point
// ============================================================
export function resolveWard(lat: number, lng: number): Ward | null {
  const wards = wardsData.wards as Ward[]
  let nearest: Ward | null = null
  let minDist = Infinity

  for (const ward of wards) {
    const dist = haversineDistance(lat, lng, ward.center_lat, ward.center_lon)
    if (dist < minDist) {
      minDist = dist
      nearest = ward
    }
  }
  return nearest
}

// ============================================================
// Check if a location is within 500m of a high-priority zone
// Returns the landmark + priority boost if found
// ============================================================
export function checkProximityBoost(
  lat: number,
  lng: number
): { landmark: Landmark; ward: Ward; distance: number } | null {
  const wards = wardsData.wards as Ward[]
  const PROXIMITY_RADIUS = wardsData.priority_rules.proximity_radius_meters

  for (const ward of wards) {
    for (const landmark of ward.landmarks) {
      const dist = haversineDistance(lat, lng, landmark.lat, landmark.lng)
      if (dist <= PROXIMITY_RADIUS) {
        return { landmark, ward, distance: Math.round(dist) }
      }
    }
  }
  return null
}

// ============================================================
// Resolve priority from zone type and visual severity
// ============================================================
export function resolvePriority(
  zoneType: string,
  severity: number,
  hazardDetected: boolean,
  proximityBoost?: string | null
): string {
  // Immediate hazard always P1
  if (hazardDetected && severity >= 4) return 'P1'

  // Proximity boost overrides (if near educational/hospital within 500m)
  if (proximityBoost === 'P1') return 'P1'
  if (proximityBoost === 'P2' && severity >= 3) return 'P2'

  const zoneDefaults = wardsData.priority_rules.zone_defaults as Record<string, string>
  const zoneDefault = zoneDefaults[zoneType] ?? 'P3'

  // Severity modifier
  if (severity >= 4) {
    // Bump up one level for high severity
    if (zoneDefault === 'P2') return 'P1'
    if (zoneDefault === 'P3') return 'P2'
    if (zoneDefault === 'P4') return 'P3'
  }
  if (severity <= 1) {
    // Bump down one level for low severity
    if (zoneDefault === 'P1') return 'P2'
    if (zoneDefault === 'P2') return 'P3'
  }

  return zoneDefault
}

// ============================================================
// Resolve department from issue category
// ============================================================
export function resolveDepartment(category: string): Department {
  const departments = wardsData.departments as Department[]
  for (const dept of departments) {
    if (dept.issues.includes(category)) return dept
  }
  // Fallback to general
  return departments[departments.length - 1]
}

// ============================================================
// Get SLA hours for a priority from a department
// ============================================================
export function getSlaHours(departmentId: string, priority: string): number {
  const departments = wardsData.departments as Department[]
  const dept = departments.find((d) => d.id === departmentId)
  return dept?.sla[priority] ?? 72
}

// ============================================================
// queryPageIndex — Vercel AI SDK tool function
// Called by Gemini during triage to get ward context
// ============================================================
export function queryPageIndex(lat: number, lng: number): string {
  const ward = resolveWard(lat, lng)
  const boost = checkProximityBoost(lat, lng)

  if (!ward) return 'No ward data found for this location.'

  let context = `Ward: ${ward.name} (Ward No. ${ward.ward_no})\nZone Type: ${ward.zone}`

  if (boost) {
    context += `\n\n⚠️ PRIORITY ESCALATION RULE TRIGGERED:`
    context += `\nThis location is ${boost.distance}m from "${boost.landmark.name}" (${boost.landmark.type}).`
    context += `\nPageIndex Rule: Issues within 500m of this landmark must be escalated to ${boost.landmark.priority_boost}.`
  }

  const zoneDefaultsMap = wardsData.priority_rules.zone_defaults as Record<string, string>
  context += `\n\nZone-based default priority: ${zoneDefaultsMap[ward.zone] ?? 'P3'}`

  return context
}

// Export all departments for the contact page
export function getAllDepartments(): Department[] {
  return wardsData.departments as Department[]
}
