// src/app/api/cron/retention/route.ts
// Feature 13: Data Retention — auto-delete records past retention period
// Invoke via: GET /api/cron/retention?secret=YOUR_CRON_SECRET
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logAction } from "@/lib/audit";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

const DEFAULT_RETENTION_DAYS = 365; // 1 year

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const retentionDays = parseInt(process.env.DATA_RETENTION_DAYS ?? String(DEFAULT_RETENTION_DAYS));
  const cutoff = new Date(Date.now() - retentionDays * 86_400_000).toISOString();

  const results: Record<string, number> = {};

  // Delete old reports
  const { data: deletedReports } = await supabaseAdmin
    .from("reports")
    .delete()
    .lt("created_at", cutoff)
    .select("id");
  results.reports = deletedReports?.length ?? 0;

  // Delete old audit log entries (beyond 2x retention)
  const auditCutoff = new Date(Date.now() - retentionDays * 2 * 86_400_000).toISOString();
  const { data: deletedAudit } = await supabaseAdmin
    .from("audit_log")
    .delete()
    .lt("created_at", auditCutoff)
    .select("id");
  results.audit_log = deletedAudit?.length ?? 0;

  // Delete old chat history
  const { data: deletedChat } = await supabaseAdmin
    .from("chat_history")
    .delete()
    .lt("created_at", cutoff)
    .select("id");
  results.chat_history = deletedChat?.length ?? 0;

  // Delete old batch jobs
  const { data: deletedBatch } = await supabaseAdmin
    .from("batch_jobs")
    .delete()
    .lt("created_at", cutoff)
    .select("id");
  results.batch_jobs = deletedBatch?.length ?? 0;

  await logAction("settings.update", {
    metadata: { action: "retention_job", cutoffDate: cutoff, deleted: results },
  });

  return NextResponse.json({
    success: true,
    retentionDays,
    cutoffDate: cutoff,
    deleted: results,
    runAt: new Date().toISOString(),
  });
}
