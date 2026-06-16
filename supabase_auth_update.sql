-- ============================================================
-- Supabase Authentication & Row Level Security (RLS) Setup
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Add user_id to reports
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Add user_id to cases
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Enable RLS on tables
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for Reports
-- Users can read, insert, update, delete their own reports
CREATE POLICY "Users can manage their own reports"
ON reports
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Optional: If the REST API uses a Service Role Key, it will bypass these RLS policies automatically.

-- 5. Create RLS Policies for Cases
-- Users can read, insert, update, delete their own cases
CREATE POLICY "Users can manage their own cases"
ON cases
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Note: Ensure that your API routes set user_id = auth.uid() when inserting new records!
