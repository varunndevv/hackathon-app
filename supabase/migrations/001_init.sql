-- ============================================================
-- CivicSync AI — Supabase Migration
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Reports table
CREATE TABLE IF NOT EXISTS reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Location stored as PostGIS geography for accurate distance calc
  location        GEOGRAPHY(POINT, 4326),
  lat             DOUBLE PRECISION,
  lng             DOUBLE PRECISION,
  -- Image
  image_url       TEXT,
  -- AI Triage results
  category        TEXT NOT NULL DEFAULT 'other',
  priority        TEXT NOT NULL DEFAULT 'P3' CHECK (priority IN ('P1','P2','P3','P4')),
  severity        INTEGER CHECK (severity BETWEEN 1 AND 5),
  reasoning       TEXT,
  suggested_action TEXT,
  ward_context    TEXT,
  -- Metadata
  ward_name       TEXT,
  zone_type       TEXT,
  department_id   TEXT,
  -- Status tracking
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','assigned','in_progress','resolved')),
  status_history  JSONB DEFAULT '[]'::jsonb,
  -- Community dedup
  upvote_count    INTEGER DEFAULT 1,
  community_ticket_id UUID,
  is_duplicate    BOOLEAN DEFAULT FALSE,
  -- Resolution
  resolution_photo_url TEXT,
  resolved_at     TIMESTAMPTZ,
  -- Anonymous citizen session
  session_id      TEXT,
  -- Timestamps
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Spatial index for fast proximity queries
CREATE INDEX IF NOT EXISTS reports_location_gist_idx
  ON reports USING GIST(location);

-- 4. Other useful indexes
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports(status);
CREATE INDEX IF NOT EXISTS reports_priority_idx ON reports(priority);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS reports_community_ticket_id_idx ON reports(community_ticket_id);

-- 5. Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id  UUID REFERENCES reports(id) ON DELETE CASCADE,
  rating     INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Helper function: find reports within 15m radius
-- Used for deduplication
CREATE OR REPLACE FUNCTION find_nearby_reports(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_radius_meters DOUBLE PRECISION DEFAULT 15
)
RETURNS TABLE (
  id UUID,
  upvote_count INTEGER,
  priority TEXT,
  status TEXT,
  community_ticket_id UUID,
  distance_meters DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.upvote_count,
    r.priority,
    r.status,
    r.community_ticket_id,
    ST_Distance(
      r.location,
      ST_MakePoint(p_lng, p_lat)::geography
    ) AS distance_meters
  FROM reports r
  WHERE
    r.status != 'resolved'
    AND ST_Distance(
      r.location,
      ST_MakePoint(p_lng, p_lat)::geography
    ) <= p_radius_meters
  ORDER BY distance_meters ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
