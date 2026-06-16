import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AuditLogViewer } from "@/components/audit/AuditLogViewer";

export const metadata: Metadata = {
  title: "Audit Log",
  description:
    "Immutable, append-only audit trail of every platform action. Search, filter, and export records for regulatory compliance and internal review.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://taylos-agent.vercel.app/audit" },
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
