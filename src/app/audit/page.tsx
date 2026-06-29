import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AuditLogViewer } from "@/components/audit/AuditLogViewer";
import { getUserRole } from "@/lib/rbac";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Audit Log",
  description:
    "Immutable, append-only audit trail of every platform action. Search, filter, and export records for regulatory compliance and internal review.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://taylos-agent.vercel.app/audit" },
};

export default async function AuditPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { role, org_id } = await getUserRole(user.id);

  let query = supabase.from("audit_log").select("*");

  if (role !== "global_admin" && org_id) {
    query = query.eq("org_id", org_id);
  }

  const { data: entries } = await query
    .order("created_at", { ascending: false })
    .limit(500);

  // Fetch roles and users details for mapping
  const { data: roles } = await supabase
    .from("user_roles")
    .select("*, users:user_id(email, full_name)");

  const mappedEntries = (entries ?? []).map((e: any) => {
    const roleInfo = (roles ?? []).find((r: any) => r.user_id === e.user_id);
    return {
      ...e,
      user_name: roleInfo?.users?.full_name || roleInfo?.users?.email || "System / Automated",
      user_role: roleInfo?.role || "system"
    };
  });

  return <AuditLogViewer entries={mappedEntries} />;
}
