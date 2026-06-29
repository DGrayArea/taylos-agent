import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { TeamManagementConsole } from "@/components/org/TeamManagementConsole";

export const metadata: Metadata = {
  title: "Team & Members | Taylos",
  description: "Manage your organisation members, assign analyst roles, and review pending invites.",
};

export default async function TeamPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { role, org_id, org_name } = await getUserRole(user.id);

  if (role !== "org_admin" || !org_id) {
    redirect("/");
  }

  return (
    <TeamManagementConsole orgId={org_id} orgName={org_name || "Organisation"} />
  );
}
