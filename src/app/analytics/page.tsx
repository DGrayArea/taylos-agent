import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { MyAnalyticsConsole } from "@/components/org/MyAnalyticsConsole";

export const metadata: Metadata = {
  title: "My Analytics | Taylos",
  description: "Your personal document review performance and case resolution activity metrics.",
};

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { role, org_id, org_name } = await getUserRole(user.id);

  if (role !== "analyst" || !org_id) {
    redirect("/");
  }

  return (
    <MyAnalyticsConsole orgId={org_id} orgName={org_name || "Organisation"} userId={user.id} />
  );
}
