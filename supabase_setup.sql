-- SQL for Supabase Tables
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Investigations Table
CREATE TABLE IF NOT EXISTS investigations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  anomaly_id TEXT NOT NULL,
  classification TEXT NOT NULL,
  confidence INTEGER NOT NULL,
  summary TEXT NOT NULL,
  recommendations TEXT[] NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved', 'dismissed'))
);

-- 2. Reports Table (for history)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  date TEXT NOT NULL,
  documents INTEGER NOT NULL,
  issues INTEGER NOT NULL,
  status TEXT DEFAULT 'Complete',
  data JSONB NOT NULL -- Full analysis JSON
);

-- Enable RLS (Optional, but recommended)
-- ALTER TABLE investigations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Note: For this demo, we assume the API key has access to these tables.
-- In production, you would add policies (e.g., auth.uid() = user_id).
