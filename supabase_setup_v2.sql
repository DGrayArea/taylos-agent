-- ============================================================
-- Taylos Agent — Multi-Tenant & Scoped RBAC Schema (v2.0)
-- Run in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ============================================================

-- 1. Create Organisations Table
CREATE TABLE IF NOT EXISTS public.organisations (
  org_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  country TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended'))
);

-- 2. Create Public Users Table
CREATE TABLE IF NOT EXISTS public.users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 3. Sync existing Auth users into Public Users table (Backfill)
INSERT INTO public.users (user_id, email, full_name, created_at)
SELECT 
  id, 
  email, 
  coalesce(
    (raw_user_meta_data::jsonb)->>'full_name', 
    nullif(trim(coalesce((raw_user_meta_data::jsonb)->>'first_name', '') || ' ' || coalesce((raw_user_meta_data::jsonb)->>'last_name', '')), ''),
    email
  ), 
  created_at
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- 4. Trigger Function to sync future Auth signups to public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (user_id, email, full_name)
  VALUES (
    new.id,
    new.email,
    coalesce(
      (new.raw_user_meta_data::jsonb)->>'full_name',
      nullif(trim(coalesce((new.raw_user_meta_data::jsonb)->>'first_name', '') || ' ' || coalesce((new.raw_user_meta_data::jsonb)->>'last_name', '')), ''),
      new.email
    )
  )
  ON CONFLICT (user_id) DO UPDATE
  SET email = excluded.email,
      full_name = excluded.full_name;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Update User Roles Table
-- Re-create user_roles to match the multi-tenant layout
DROP TABLE IF EXISTS public.user_roles CASCADE;
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organisations(org_id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('global_admin', 'org_admin', 'analyst', 'auditor')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  CONSTRAINT unique_user_org_role UNIQUE (user_id, org_id)
);

-- Index for role lookup
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_org_id ON public.user_roles(org_id);

-- 6. Seed gideonakodi@gmail.com as Global Admin
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE email = 'gideonakodi@gmail.com';
  IF target_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, org_id, role)
    VALUES (target_user_id, NULL, 'global_admin')
    ON CONFLICT (user_id, org_id) DO UPDATE SET role = 'global_admin';
  END IF;
END $$;

-- 7. Create Org Invitations Table
CREATE TABLE IF NOT EXISTS public.org_invitations (
  invitation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organisations(org_id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('org_admin', 'analyst', 'auditor')),
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_org_invitations_token ON public.org_invitations(token);

-- 8. Add org_id Columns to all client entity tables
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organisations(org_id) ON DELETE CASCADE;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organisations(org_id) ON DELETE CASCADE;
ALTER TABLE public.batch_jobs ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organisations(org_id) ON DELETE CASCADE;
ALTER TABLE public.api_keys ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organisations(org_id) ON DELETE CASCADE;
ALTER TABLE public.audit_log ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organisations(org_id) ON DELETE CASCADE;
ALTER TABLE public.chat_history ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organisations(org_id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_reports_org_id ON public.reports(org_id);
CREATE INDEX IF NOT EXISTS idx_cases_org_id ON public.cases(org_id);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_org_id ON public.batch_jobs(org_id);

-- 9. Row-Level Security (RLS) Configuration
-- We enable RLS on org-scoped tables so Postgres natively filters data by org_id
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_invitations ENABLE ROW LEVEL SECURITY;

-- Dynamic Policy Helper Functions
CREATE OR REPLACE FUNCTION public.get_user_orgs()
RETURNS UUID[] AS $$
  SELECT coalesce(array_agg(org_id), '{}'::UUID[])
  FROM public.user_roles
  WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_global_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'global_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Apply RLS Policies
DROP POLICY IF EXISTS "Global admins see all orgs, members see their own" ON public.organisations;
CREATE POLICY "Global admins see all orgs, members see their own" ON public.organisations
  AS PERMISSIVE FOR ALL TO authenticated
  USING (public.is_global_admin() OR org_id = ANY(public.get_user_orgs()));

DROP POLICY IF EXISTS "Scoped access to reports" ON public.reports;
CREATE POLICY "Scoped access to reports" ON public.reports
  FOR ALL TO authenticated
  USING (public.is_global_admin() OR org_id = ANY(public.get_user_orgs()))
  WITH CHECK (public.is_global_admin() OR org_id = ANY(public.get_user_orgs()));

DROP POLICY IF EXISTS "Scoped access to cases" ON public.cases;
CREATE POLICY "Scoped access to cases" ON public.cases
  FOR ALL TO authenticated
  USING (public.is_global_admin() OR org_id = ANY(public.get_user_orgs()))
  WITH CHECK (public.is_global_admin() OR org_id = ANY(public.get_user_orgs()));

DROP POLICY IF EXISTS "Scoped access to batch jobs" ON public.batch_jobs;
CREATE POLICY "Scoped access to batch jobs" ON public.batch_jobs
  FOR ALL TO authenticated
  USING (public.is_global_admin() OR org_id = ANY(public.get_user_orgs()))
  WITH CHECK (public.is_global_admin() OR org_id = ANY(public.get_user_orgs()));
