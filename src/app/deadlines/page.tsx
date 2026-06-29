import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { DeadlinesConsole } from "@/components/org/DeadlinesConsole";

export const metadata: Metadata = {
  title: "Compliance Deadlines | Taylos",
  description: "Track regulatory deadlines across all financial audit and fraud cases.",
};

export default async function DeadlinesPage() {
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
    <DeadlinesConsole orgId={org_id} orgName={org_name || "Organisation"} />
  );
}
