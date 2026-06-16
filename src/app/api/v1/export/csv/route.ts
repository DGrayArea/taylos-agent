// src/app/api/v1/export/csv/route.ts
// Feature 9: CSV Export — streams anomaly data as CSV
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ComprehensiveAnalysis, Anomaly } from "@/lib/types";
import * as XLSX from "xlsx";

function anomaliesToCSV(anomalies: Anomaly[], reportDate: string): Buffer {
  const rows = anomalies.map((a) => ({
    "Report Date": reportDate,
    "Anomaly ID": a.id,
    "Type": a.type,
    "Category": a.category,
    "Severity": a.severity,
    "Anomaly Score": a.anomaly_score,
    "Confidence (%)": a.confidence,
    "Description": a.description,
    "Financial Impact": a.financial_impact ?? "",
    "Recommended Action": a.recommended_action ?? "",
    "Affected Transactions": a.affected_transactions.join("; "),
    "Evidence Points": a.evidence_points.join("; "),
    "First Occurrence": a.first_occurrence ?? "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Anomalies");
  return XLSX.write(wb, { type: "buffer", bookType: "csv" }) as Buffer;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reportId = searchParams.get("reportId");

  const supabase = await createClient();

  let query = supabase
    .from("reports")
    .select("id, created_at, data")
    .order("created_at", { ascending: false });

  if (reportId) {
    query = query.eq("id", reportId);
  }

  const { data: reports } = await query.limit(reportId ? 1 : 1).maybeSingle();

  if (!reports) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  const report = reports as { id: string; created_at: string; data: ComprehensiveAnalysis };
  const anomalies = report.data?.feature_2_anomalies?.anomaly_list ?? [];
  const csvBuffer = anomaliesToCSV(anomalies, report.created_at);

  return new Response(new Uint8Array(csvBuffer), {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="taylos-report-${report.id.slice(0, 8)}.csv"`,
    },
  });
}
