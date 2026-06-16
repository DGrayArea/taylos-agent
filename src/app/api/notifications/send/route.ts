// src/app/api/notifications/send/route.ts
// Feature 14: Customer Notification System — send emails via Resend
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateAnomalyEmail, generateResolutionEmail } from "@/lib/emailTemplates";
import { logAction } from "@/lib/audit";
import { Anomaly } from "@/lib/types";
import { Resend } from "resend";

export async function POST(request: Request) {
  const supabase = await createClient();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { type, caseId, anomalyId, reportId, recipientEmail, recipientName, resolution, analystName } = body as {
    type: "anomaly_alert" | "case_resolved";
    caseId?: string;
    anomalyId?: string;
    reportId?: string;
    recipientEmail?: string;
    recipientName?: string;
    resolution?: string;
    analystName?: string;
  };

  if (!recipientEmail) {
    return NextResponse.json({ error: "recipientEmail is required." }, { status: 400 });
  }

  let emailDraft;

  if (type === "anomaly_alert" && anomalyId && reportId) {
    // Fetch anomaly from report
    const { data: report } = await supabase
      .from("reports")
      .select("data")
      .eq("id", reportId)
      .maybeSingle();

    const anomaly = (report?.data?.feature_2_anomalies?.anomaly_list ?? []).find(
      (a: Anomaly) => a.id === anomalyId,
    ) as Anomaly | undefined;

    if (!anomaly) {
      return NextResponse.json({ error: "Anomaly not found." }, { status: 404 });
    }

    emailDraft = generateAnomalyEmail(anomaly, caseId ?? anomalyId, recipientName);
  } else if (type === "case_resolved" && caseId && resolution) {
    emailDraft = generateResolutionEmail(caseId, resolution, analystName ?? "Your analyst");
  } else {
    return NextResponse.json({ error: "Invalid notification type or missing fields." }, { status: 400 });
  }

  // Send via Resend
  try {
    const resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "noreply@taylosfinance.com",
      to: [recipientEmail],
      subject: emailDraft.subject,
      html: emailDraft.html,
      text: emailDraft.text,
    });

    if (error) throw error;

    await logAction("notification.send", {
      resourceType: "case",
      resourceId: caseId,
      metadata: { type, recipientEmail, emailId: data?.id },
    });

    return NextResponse.json({ success: true, emailId: data?.id, preview: emailDraft.html });
  } catch (err) {
    console.error("[notifications/send] Resend error:", err);
    // Return the preview even if sending fails (for dev/demo)
    return NextResponse.json({
      success: false,
      error: "Email delivery failed — check RESEND_API_KEY",
      preview: emailDraft.html,
      subject: emailDraft.subject,
    }, { status: 200 }); // Return 200 so the UI can still show the preview
  }
}

// GET: generate a preview without sending
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const anomalyId = searchParams.get("anomalyId");
  const reportId = searchParams.get("reportId");
  const caseId = searchParams.get("caseId") ?? anomalyId ?? "PREVIEW";

  if (!anomalyId || !reportId) {
    return NextResponse.json({ error: "anomalyId and reportId required." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: report } = await supabase
    .from("reports")
    .select("data")
    .eq("id", reportId)
    .maybeSingle();

  const anomaly = (report?.data?.feature_2_anomalies?.anomaly_list ?? []).find(
    (a: Anomaly) => a.id === anomalyId,
  ) as Anomaly | undefined;

  if (!anomaly) return NextResponse.json({ error: "Anomaly not found." }, { status: 404 });

  const draft = generateAnomalyEmail(anomaly, caseId);
  return NextResponse.json({ subject: draft.subject, html: draft.html, text: draft.text });
}
