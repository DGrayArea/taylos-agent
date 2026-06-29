import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { SupportConsole } from "@/components/org/SupportConsole";

export const metadata: Metadata = {
  title: "Support Tickets | Taylos",
  description: "Request technical billing or compliance support from Taylos experts.",
};

export default async function SupportPage() {
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
    <SupportConsole orgId={org_id} orgName={org_name || "Organisation"} />
  );
}
