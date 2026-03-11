-- UVision Safety App — Supabase Schema
-- Run this in the Supabase SQL editor to initialise the database.

-- ────────────────────────────────────────────────────────────────────────────
-- incidents table
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.incidents (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  latitude      FLOAT8      NOT NULL,
  longitude     FLOAT8      NOT NULL,
  timestamp     TIMESTAMPTZ DEFAULT now() NOT NULL,
  max_g_force   FLOAT8      NOT NULL,
  incident_type TEXT        NOT NULL CHECK (incident_type IN ('freefall', 'impact', 'panic'))
);

-- Index on timestamp for efficient dashboard queries
CREATE INDEX IF NOT EXISTS incidents_timestamp_idx ON public.incidents (timestamp DESC);

-- ────────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (mobile app uses anon key)
CREATE POLICY "anon_insert" ON public.incidents
  FOR INSERT TO anon WITH CHECK (true);

-- Allow authenticated reads (web dashboard)
CREATE POLICY "anon_select" ON public.incidents
  FOR SELECT TO anon USING (true);
