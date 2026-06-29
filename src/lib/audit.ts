// src/lib/audit.ts
// Feature 12: Immutable Audit Log
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

export type AuditAction =
  | "upload.document"
  | "analysis.run"
  | "analysis.complete"
  | "case.create"
  | "case.update"
  | "case.resolve"
  | "case.assign"
  | "case.comment"
  | "report.export"
  | "report.delete"
  | "notification.send"
  | "batch.submit"
  | "batch.complete"
  | "apikey.create"
  | "apikey.revoke"
  | "webhook.register"
  | "webhook.delete"
  | "user.login"
  | "user.logout"
  | "settings.update"
  | "team.invite"
  | "team.promote"
  | "team.suspend"
  | "team.revoke"
  | "org.suspend"
  | "org.unsuspend";

export interface AuditEntry {
  id: string;
  user_id: string | null;
  org_id: string | null;
  action: AuditAction;
  resource_type: string | null;
  resource_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

export async function logAction(
  action: AuditAction,
  options: {
    userId?: string | null;
    orgId?: string | null;
    resourceType?: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string | null;
  } = {},
): Promise<void> {
  try {
    await supabaseAdmin.from("audit_log").insert({
      user_id: options.userId ?? null,
      org_id: options.orgId ?? null,
      action,
      resource_type: options.resourceType ?? null,
      resource_id: options.resourceId ?? null,
      metadata: options.metadata ?? {},
      ip_address: options.ipAddress ?? null,
    });
  } catch (err) {
    // Audit logging must never crash the main flow
    console.error("[audit] Failed to write audit entry:", err);
  }
}

export async function queryAuditLog(filters: {
  orgId?: string | null;
  userId?: string;
  action?: AuditAction;
  resourceType?: string;
  from?: string;
  to?: string;
  limit?: number;
}): Promise<AuditEntry[]> {
  let query = supabaseAdmin
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(filters.limit ?? 200);

  if (filters.orgId !== undefined) {
    if (filters.orgId === null) {
      query = query.is("org_id", null);
    } else {
      query = query.eq("org_id", filters.orgId);
    }
  }
  if (filters.userId) query = query.eq("user_id", filters.userId);
  if (filters.action) query = query.eq("action", filters.action);
  if (filters.resourceType) query = query.eq("resource_type", filters.resourceType);
  if (filters.from) query = query.gte("created_at", filters.from);
  if (filters.to) query = query.lte("created_at", filters.to);

  const { data } = await query;
  return (data ?? []) as AuditEntry[];
}
