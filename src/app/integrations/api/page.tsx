import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { ApiKeysWebhooksConsole } from "@/components/org/ApiKeysWebhooksConsole";

export const metadata: Metadata = {
  title: "API Settings | Taylos",
  description: "Configure webhook hooks and active API credentials.",
};

export default async function ApiIntegrationsPage() {
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
    <ApiKeysWebhooksConsole orgId={org_id} orgName={org_name || "Organisation"} />
  );
}
