// src/app/api/report/pdf/route.ts
// PURPOSE: Generates a formatted, human-readable PDF report from a saved report
// Uses @react-pdf/renderer server-side

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import { FinancialReportPDF } from "@/lib/pdf/FinancialReportPDF";
import { ReportHistoryRow, ComprehensiveAnalysis } from "@/lib/types";

type PdfRequestBody = {
  analysis?: ComprehensiveAnalysis;
  reportId?: string;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get("id");

    if (!reportId) {
      return NextResponse.json(
        { error: "Report ID required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const { data: report, error } = await supabase
      .from("reports")
      .select("*")
      .eq("id", reportId)
      .single();

    if (error || !report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const typedReport = report as ReportHistoryRow;
    const element = createElement(FinancialReportPDF, {
      report: typedReport,
    }) as unknown as ReactElement<DocumentProps>;

    const pdfBuffer = await renderToBuffer(element);

    const filename = `Taylos-Financial-Report-${report.id.substring(0, 8).toUpperCase()}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    console.error("[/api/report/pdf] Error:", error);
    return NextResponse.json(
      { error: "PDF generation failed.", details: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

// Also support POST with raw analysis data (for immediately after upload)
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PdfRequestBody;
    const { analysis, reportId } = body;

    if (!analysis && !reportId) {
      return NextResponse.json(
        { error: "analysis or reportId required" },
        { status: 400 },
      );
    }

    let reportData: ComprehensiveAnalysis | ReportHistoryRow | undefined =
      analysis;

    if (reportId && !analysis) {
      const supabase = await createClient();
      const { data: report } = await supabase
        .from("reports")
        .select("*")
        .eq("id", reportId)
        .single();
      if (report) reportData = report as ReportHistoryRow;
    }

    if (!reportData) {
      return NextResponse.json(
        { error: "Report data not found." },
        { status: 404 },
      );
    }

    const pdfElement = createElement(FinancialReportPDF, {
      report: reportData,
    }) as unknown as ReactElement<DocumentProps>;
    const pdfBuffer = await renderToBuffer(pdfElement);

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `Taylos-Financial-Report-${dateStr}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    console.error("[/api/report/pdf POST] Error:", error);
    return NextResponse.json(
      { error: "PDF generation failed.", details: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
