-- ============================================================
-- Taylos Agent — FULL Database Schema
-- Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ============================================================

-- 1. Investigations Table (existing)
CREATE TABLE IF NOT EXISTS investigations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  anomaly_id TEXT NOT NULL,
  classification TEXT NOT NULL,
  confidence INTEGER NOT NULL,
  summary TEXT NOT NULL,
  recommendations TEXT[] NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved', 'dismissed'))
);

-- 2. Reports Table (existing — add new columns if missing)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  date TEXT NOT NULL,
  documents INTEGER NOT NULL,
  issues INTEGER NOT NULL,
  status TEXT DEFAULT 'Complete',
  data JSONB NOT NULL,
  source TEXT DEFAULT 'dashboard',   -- 'dashboard' | 'rest_api' | 'batch_api' | 'monitor'
  org_name TEXT,
  batch_id UUID
);

-- ============================================================
-- NEW TABLES FOR 15-FEATURE UPDATE
-- ============================================================

-- 3. API Keys (Feature 1: REST API)
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,           -- SHA-256 hash of the raw key
  org_name TEXT NOT NULL,
  rate_limit INTEGER NOT NULL DEFAULT 100, -- requests per hour
  requests_this_hour INTEGER NOT NULL DEFAULT 0,
  last_reset_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT
);

-- 4. Webhook Endpoints (Feature 3)
CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,                   -- HMAC signing secret
  events TEXT[] NOT NULL DEFAULT '{}',    -- e.g. ['analysis.complete', 'batch.complete']
  active BOOLEAN NOT NULL DEFAULT true,
  description TEXT
);

-- 5. Webhook Deliveries (audit trail for webhook attempts)
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  endpoint_id UUID REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('delivered', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 1
);

-- 6. Batch Jobs (Feature 6: Batch Processing)
CREATE TABLE IF NOT EXISTS batch_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing'
    CHECK (status IN ('processing', 'complete', 'partial', 'failed')),
  document_count INTEGER NOT NULL DEFAULT 0,
  results JSONB,                           -- { summary: { total, success, failed }, jobs: [...] }
  org_name TEXT,
  source TEXT DEFAULT 'batch_api'
);

-- 7. Cases (Feature 10: Case Management)
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  anomaly_id TEXT NOT NULL,
  report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  severity TEXT NOT NULL DEFAULT 'MEDIUM',
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_review', 'resolved')),
  assignee TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  comments JSONB DEFAULT '[]',             -- [{ text, author, created_at }]
  resolution_note TEXT
);

-- 8. User Roles (Feature 11: RBAC)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  user_id UUID NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'viewer'
    CHECK (role IN ('admin', 'analyst', 'auditor', 'viewer')),
  granted_by UUID,
  notes TEXT
);

-- 9. Audit Log (Feature 12: Immutable Audit Log)
-- IMPORTANT: Only INSERT is allowed. Enforce via RLS (see below).
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  user_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT
);

-- 10. Chat History (Feature 15: Agent Chat)
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',  -- [{ role, content, timestamp }]
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 11. Anomaly Embeddings (Feature 5: Pattern Learning)
-- Note: Enable pgvector extension first: CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS anomaly_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  anomaly_id TEXT NOT NULL,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  anomaly_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  description TEXT NOT NULL,
  classification TEXT,
  confidence INTEGER,
  embedding TEXT    -- JSON-encoded float array (upgrade to vector(128) with pgvector)
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_severity ON cases(severity);
CREATE INDEX IF NOT EXISTS idx_cases_anomaly_id ON cases(anomaly_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_status ON batch_jobs(status);
CREATE INDEX IF NOT EXISTS idx_anomaly_embeddings_type ON anomaly_embeddings(anomaly_type);

-- ============================================================
-- RLS POLICIES (Recommended for production)
-- ============================================================

-- Enable RLS
-- ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Audit log: INSERT only (no UPDATE, no DELETE) for all authenticated users
-- CREATE POLICY "audit_log_insert_only" ON audit_log
--   FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================
-- SAMPLE DATA (Optional — for testing)
-- ============================================================

-- Insert a demo API key (raw key: tk_demo_key_for_testing_only)
-- The hash below is SHA-256("tk_demo_key_for_testing_only")
-- INSERT INTO api_keys (key_hash, org_name, rate_limit)
-- VALUES ('b3a4...your_hash_here', 'Demo Organisation', 1000)
-- ON CONFLICT DO NOTHING;

-- Insert a demo admin user role (replace with your Supabase auth user ID)
-- INSERT INTO user_roles (user_id, role, notes)
-- VALUES ('your-user-uuid', 'admin', 'Platform administrator')
-- ON CONFLICT (user_id) DO NOTHING;
