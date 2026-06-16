// src/app/cases/[id]/page.tsx
// Feature 10: Case detail view
import { createClient } from "@/lib/supabase/server";
import { CaseDetail } from "@/components/cases/CaseDetail";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Case Detail | Taylos Finance",
};

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: caseData } = await supabase.from("cases").select("*").eq("id", id).maybeSingle();
  if (!caseData) notFound();

  // Fetch associated report if linked
  let anomaly = null;
  if (caseData.report_id) {
    const { data: report } = await supabase
      .from("reports")
      .select("data")
      .eq("id", caseData.report_id)
      .maybeSingle();
    anomaly =
      (report?.data?.feature_2_anomalies?.anomaly_list ?? []).find(
        (a: { id: string }) => a.id === caseData.anomaly_id,
      ) ?? null;
  }

  return <CaseDetail caseData={caseData} anomaly={anomaly} />;
}
