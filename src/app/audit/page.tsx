// src/app/audit/page.tsx
// Feature 12: Audit Log — admin-only immutable log viewer
import { createClient } from "@/lib/supabase/server";
import { AuditLogViewer } from "@/components/audit/AuditLogViewer";

export const metadata = {
  title: "Audit Log | Taylos Finance",
  description: "Immutable record of all platform actions for regulatory compliance.",
};

export default async function AuditPage() {
  const supabase = await createClient();

  const { data: entries } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  return <AuditLogViewer entries={entries ?? []} />;
}
