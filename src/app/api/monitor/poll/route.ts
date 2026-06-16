// src/app/api/monitor/poll/route.ts
// Feature 4: Continuous Monitoring Mode — trigger re-analysis from stored data source
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runPlatformAnalysis } from "@/lib/analysis";
import { fireWebhooks } from "@/lib/webhook";
import { logAction } from "@/lib/audit";

export async function POST(request: Request) {
  const supabase = await createClient();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { sourceUrl, accountRef, threshold } = body as {
    sourceUrl?: string;
    accountRef?: string;
    threshold?: "critical" | "high" | "medium" | "low";
  };

  // Demo mode: fetch from sourceUrl or use synthetic data
  let rawText = "";
  if (sourceUrl) {
    try {
      const res = await fetch(sourceUrl, { signal: AbortSignal.timeout(5000) });
      rawText = await res.text();
    } catch {
      rawText = `Monitoring check for ${accountRef ?? "account"} at ${new Date().toISOString()}`;
    }
  } else {
    rawText = `Live monitoring check for ${accountRef ?? "account"} at ${new Date().toISOString()}. No external data source configured.`;
  }

  const analysis = await runPlatformAnalysis([
    {
      filename: `monitor-${accountRef ?? "live"}-${Date.now()}.txt`,
      content_type: "text/plain",
      raw_text: rawText,
    },
  ]);

  // Save to reports
  const { data: report } = await supabase
    .from("reports")
    .insert({
      date: new Date().toISOString().slice(0, 10),
      documents: 1,
      issues: analysis.feature_2_anomalies.total_anomalies_found,
      status: "Complete",
      data: analysis,
      source: "monitor",
    })
    .select("id")
    .single();

  // Check threshold for alerts
  const criticalSeverities = ["critical", "high", "medium", "low"];
  const alertThreshold = threshold ?? "high";
  const thresholdIndex = criticalSeverities.indexOf(alertThreshold);
  const hasAlert = criticalSeverities.slice(0, thresholdIndex + 1).some((level) => {
    return (analysis.feature_2_anomalies.anomalies_by_severity as Record<string, number>)[level] > 0;
  });

  await logAction("analysis.run", {
    resourceId: report?.id,
    metadata: { source: "monitor", accountRef, hasAlert },
  });

  if (hasAlert) {
    fireWebhooks("monitor.alert", {
      reportId: report?.id,
      accountRef,
      anomalies: analysis.feature_2_anomalies.anomaly_list.filter(
        (a) => criticalSeverities.slice(0, thresholdIndex + 1).includes(a.severity.toLowerCase()),
      ),
    }).catch(console.error);
  }

  return NextResponse.json({
    reportId: report?.id,
    hasAlert,
    anomalyCount: analysis.feature_2_anomalies.total_anomalies_found,
    bySeverity: analysis.feature_2_anomalies.anomalies_by_severity,
    summary: analysis.executive_summary,
    timestamp: new Date().toISOString(),
  });
}
