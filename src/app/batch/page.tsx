import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { BatchJobsConsole } from "@/components/org/BatchJobsConsole";

export const metadata: Metadata = {
  title: "Batch Processing Jobs | Taylos",
  description: "Submit multiple documents for simultaneous parallel processing checks.",
};

export default async function BatchJobsPage() {
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
    <BatchJobsConsole orgId={org_id} orgName={org_name || "Organisation"} />
  );
}
