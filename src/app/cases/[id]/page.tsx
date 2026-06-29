import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CaseDetail } from "@/components/cases/CaseDetail";
import { getUserRole } from "@/lib/rbac";
import { notFound } from "next/navigation";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("cases").select("title, severity").eq("id", id).maybeSingle();
  return {
    title: data?.title ? `${data.title}` : "Case Detail",
    description: data
      ? `Investigating ${data.severity} severity anomaly: ${data.title}. Track status, add comments, and resolve the case.`
      : "View and manage an anomaly investigation case.",
    robots: { index: false, follow: false },
  };
}

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) notFound();

  const { role, org_id } = await getUserRole(user.id);
  if (!role || !org_id) notFound();

  const { data: caseData } = await supabase
    .from("cases")
    .select("*")
    .eq("id", id)
    .eq("org_id", org_id)
    .maybeSingle();

  if (!caseData) notFound();

  // Fetch associated report if linked
  let anomaly = null;
  if (caseData.report_id) {
    const { data: report } = await supabase
      .from("reports")
      .select("data")
      .eq("id", caseData.report_id)
      .eq("org_id", org_id)
      .maybeSingle();
    anomaly =
      (report?.data?.feature_2_anomalies?.anomaly_list ?? []).find(
        (a: { id: string }) => a.id === caseData.anomaly_id,
      ) ?? null;
  }

  return <CaseDetail caseData={caseData} anomaly={anomaly} userRole={role} />;
}
