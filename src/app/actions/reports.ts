"use server";

// src/app/actions/reports.ts
// PURPOSE: Server Actions for generating and managing reports.

import { createClient } from "@/lib/supabase/server";
import { ComprehensiveAnalysis } from "@/lib/types";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// ─────────────────────────────────────────────────────────────
// Generate PDF Report
// ─────────────────────────────────────────────────────────────
export async function generatePDFReport(
  analysis: ComprehensiveAnalysis,
): Promise<Buffer> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  doc.text(analysis.executive_summary.finding, 10, 10);
  return Buffer.from(doc.output("arraybuffer"));
}

// ─────────────────────────────────────────────────────────────
// Export as JSON
// ─────────────────────────────────────────────────────────────
export async function exportAsJSON(
  analysis: ComprehensiveAnalysis,
): Promise<string> {
  return JSON.stringify(analysis, null, 2);
}

// ─────────────────────────────────────────────────────────────
// Email Summary
// ─────────────────────────────────────────────────────────────
export async function emailReport(to: string, analysis: ComprehensiveAnalysis) {
  console.log(
    `[emailReport] TODO: Set up email provider. Recipient: ${to}. Summary: ${analysis.executive_summary.finding}`,
  );

  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// Save report to history (DB) — with deduplication guard
// ─────────────────────────────────────────────────────────────
export async function saveReportToHistory(analysis: ComprehensiveAnalysis) {
  const supabase = await createClient();

  const analysisDate = analysis.analysis_metadata.analysis_date;

  const windowStart = new Date(
    new Date(analysisDate).getTime() - 60_000,
  ).toISOString();
  const windowEnd = new Date(
    new Date(analysisDate).getTime() + 60_000,
  ).toISOString();

  const { data: existing, error: existingError } = await supabase
    .from("reports")
    .select("id")
    .gte("date", windowStart)
    .lte("date", windowEnd)
    .eq("documents", analysis.analysis_metadata.documents_processed)
    .maybeSingle();

  if (existingError) {
    console.error("[saveReportToHistory] Dedup check failed:", existingError);
    throw new Error(existingError.message);
  }

  if (existing?.id) {
    return { success: true, id: existing.id, deduplicated: true };
  }

  const { data, error } = await supabase
    .from("reports")
    .insert([
      {
        date: analysisDate,
        documents: analysis.analysis_metadata.documents_processed,
        issues: analysis.feature_2_anomalies.total_anomalies_found,
        status: "Complete",
        data: analysis,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("[saveReportToHistory] Error:", error);
    throw new Error(error.message);
  }

  return { success: true, id: data.id };
}
