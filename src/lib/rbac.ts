// src/lib/rbac.ts
// Feature 11: Role-Based Access Control
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

export type Role = "admin" | "analyst" | "auditor" | "viewer";

export const PERMISSIONS: Record<string, Role[]> = {
  // Cases
  "cases:read": ["admin", "analyst", "auditor", "viewer"],
  "cases:write": ["admin", "analyst"],
  "cases:delete": ["admin"],
  "cases:assign": ["admin", "analyst"],
  // Reports
  "reports:read": ["admin", "analyst", "auditor", "viewer"],
  "reports:delete": ["admin"],
  // Audit Log
  "audit:read": ["admin", "auditor"],
  // API Keys
  "apikeys:manage": ["admin"],
  // Webhooks
  "webhooks:manage": ["admin"],
  // Analytics
  "analytics:read": ["admin", "analyst", "auditor"],
  // Batch
  "batch:submit": ["admin", "analyst"],
  "batch:read": ["admin", "analyst", "auditor"],
  // Notifications
  "notifications:send": ["admin", "analyst"],
};

export async function getUserRole(userId: string): Promise<Role> {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  return (data?.role as Role) ?? "viewer";
}

export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  const role = await getUserRole(userId);
  const allowed = PERMISSIONS[permission] ?? [];
  return allowed.includes(role);
}

export function requirePermission(permission: string, role: Role): boolean {
  const allowed = PERMISSIONS[permission] ?? [];
  return allowed.includes(role);
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  admin: "Full access — manage users, API keys, webhooks, and all data.",
  analyst: "Analyse documents, manage cases, send notifications.",
  auditor: "Read-only access to reports, cases, and audit log. Cannot modify.",
  viewer: "Read-only access to reports and analytics.",
};
