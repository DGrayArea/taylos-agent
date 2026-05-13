"use server";

// src/app/actions/reports.ts
// PURPOSE: Server Actions for generating and managing reports.
//
// WHAT YOU NEED TO DO:
// For PDF generation, choose a library:
//   - pnpm add @react-pdf/renderer   (React-based PDF)
//   - pnpm add jspdf                 (programmatic PDF)
// For email, use Resend or Nodemailer.

import { ComprehensiveAnalysis } from "@/lib/agent/types";

// ─────────────────────────────────────────────────────────────
// Generate PDF Report
// ─────────────────────────────────────────────────────────────
export async function generatePDFReport(analysis: ComprehensiveAnalysis): Promise<Buffer> {
  // TODO: Generate PDF from analysis data
  // Example with jsPDF:
  // const { jsPDF } = await import("jspdf");
  // const doc = new jsPDF();
  // doc.text(analysis.executive_summary.finding, 10, 10);
  // return Buffer.from(doc.output("arraybuffer"));

  throw new Error("PDF generation not yet implemented.");
}

// ─────────────────────────────────────────────────────────────
// Export as JSON
// ─────────────────────────────────────────────────────────────
export async function exportAsJSON(analysis: ComprehensiveAnalysis): Promise<string> {
  // This one is already functional — just serialize
  return JSON.stringify(analysis, null, 2);
}

// ─────────────────────────────────────────────────────────────
// Email Summary
// ─────────────────────────────────────────────────────────────
export async function emailReport(to: string, analysis: ComprehensiveAnalysis) {
  // TODO: Set up Resend: pnpm add resend
  // import { Resend } from "resend";
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: "reports@yourdomain.com",
  //   to,
  //   subject: `Financial Intelligence Report — ${analysis.analysis_metadata.analysis_date}`,
  //   text: analysis.executive_summary.finding,
  // });

  console.log(`[emailReport] TODO: Set up email provider. Recipient: ${to}`);
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// Save report to history (DB)
// ─────────────────────────────────────────────────────────────
export async function saveReportToHistory(analysis: ComprehensiveAnalysis) {
  // TODO: Save to your database so it shows in /history
  // const { error } = await supabase.from("reports").insert({
  //   date: analysis.analysis_metadata.analysis_date,
  //   documents: analysis.analysis_metadata.documents_processed,
  //   issues: analysis.feature_2_anomalies.total_anomalies_found,
  //   status: "Complete",
  //   data: analysis,
  // });

  console.log("[saveReportToHistory] TODO: Connect database.");
  return { success: true, id: `REP-${Date.now()}` };
}
