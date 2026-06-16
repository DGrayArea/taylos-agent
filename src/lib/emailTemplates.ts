// src/lib/emailTemplates.ts
// Feature 14: Customer Notification System — plain-language email templates per anomaly type
import { Anomaly } from "@/lib/types";

export interface EmailDraft {
  subject: string;
  html: string;
  text: string;
}

const BASE_STYLE = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
  color: #1a1a2e;
`;

export function generateAnomalyEmail(anomaly: Anomaly, caseId: string, accountRef?: string): EmailDraft {
  const subjectMap: Record<string, string> = {
    DUPLICATE_TRANSACTION: "⚠️ Possible Duplicate Transaction Detected",
    UNUSUAL_PATTERN: "🔍 Unusual Activity Identified on Your Account",
    SELF_APPROVAL: "🚨 Self-Approval Irregularity Requires Attention",
    GHOST_VENDOR: "⚠️ Unverified Vendor Payment Flagged for Review",
    SPLIT_TRANSACTION: "🔍 Split Transaction Pattern Detected",
    OFFSHORE_TRANSFER: "🚨 Large Offshore Transfer Under Review",
    PAYROLL_ANOMALY: "⚠️ Payroll Discrepancy Detected",
    MISSING_DOCUMENTATION: "📄 Missing Documentation for Transaction",
    VELOCITY_ANOMALY: "🔔 Unusual Transaction Volume Detected",
    BILLING_ERROR: "💳 Potential Billing Error Identified",
  };

  const subject = subjectMap[anomaly.type] ?? `⚠️ Financial Anomaly Detected — Case ${caseId}`;

  const severityColor: Record<string, string> = {
    CRITICAL: "#ef4444",
    HIGH: "#f97316",
    MEDIUM: "#f59e0b",
    LOW: "#3b82f6",
  };

  const color = severityColor[anomaly.severity] ?? "#6b7280";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="${BASE_STYLE}">
  <div style="background: #0a1628; padding: 24px 32px; border-radius: 12px 12px 0 0;">
    <h1 style="color: #d4af37; margin: 0; font-size: 22px;">Taylos Finance</h1>
    <p style="color: #94a3b8; margin: 4px 0 0; font-size: 14px;">Financial Intelligence Platform</p>
  </div>

  <div style="padding: 32px; border: 1px solid #e2e8f0; border-top: 4px solid ${color}; border-radius: 0 0 12px 12px;">
    <div style="background: ${color}15; border: 1px solid ${color}30; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
      <strong style="color: ${color}; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
        ${anomaly.severity} Priority — Case #${caseId}
      </strong>
    </div>

    <h2 style="color: #1a1a2e; margin: 0 0 16px;">${subject.replace(/[⚠️🔍🚨📄🔔💳]/u, "").trim()}</h2>

    <p style="color: #475569; line-height: 1.6;">
      ${anomaly.description}
    </p>

    ${accountRef ? `<p style="color: #475569;">Account Reference: <strong>${accountRef}</strong></p>` : ""}

    <h3 style="color: #1a1a2e; margin: 24px 0 12px; font-size: 15px;">What We Found</h3>
    <ul style="color: #475569; line-height: 1.8; padding-left: 20px;">
      ${anomaly.evidence_points.map((p) => `<li>${p}</li>`).join("")}
    </ul>

    ${anomaly.financial_impact ? `
    <div style="background: #fef3cd; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <strong style="color: #92400e;">Financial Impact: </strong>
      <span style="color: #78350f;">${anomaly.financial_impact}</span>
    </div>` : ""}

    <h3 style="color: #1a1a2e; margin: 24px 0 12px; font-size: 15px;">Recommended Action</h3>
    <p style="color: #475569; line-height: 1.6;">
      ${anomaly.recommended_action ?? "Please review the flagged transaction(s) and contact your finance team immediately if this activity is unauthorised."}
    </p>

    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
      <p style="color: #94a3b8; font-size: 13px; margin: 0;">
        This notification was generated automatically by Taylos Finance Platform.
        If you believe this is an error, please contact your compliance team with case reference <strong>${caseId}</strong>.
      </p>
    </div>
  </div>
</body>
</html>`;

  const text = `
Taylos Finance — ${subject}

Case Reference: ${caseId}
Severity: ${anomaly.severity}

${anomaly.description}

Evidence Points:
${anomaly.evidence_points.map((p) => `• ${p}`).join("\n")}

${anomaly.financial_impact ? `Financial Impact: ${anomaly.financial_impact}\n` : ""}

Recommended Action:
${anomaly.recommended_action ?? "Review the flagged transaction(s) and contact your finance team."}

—
Taylos Finance Platform. Automated notification — do not reply.
`.trim();

  return { subject, html, text };
}

export function generateResolutionEmail(
  caseId: string,
  resolution: string,
  analystName: string,
): EmailDraft {
  const subject = `✅ Case #${caseId} Resolved`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="${BASE_STYLE}">
  <div style="background: #0a1628; padding: 24px 32px; border-radius: 12px 12px 0 0;">
    <h1 style="color: #d4af37; margin: 0; font-size: 22px;">Taylos Finance</h1>
  </div>
  <div style="padding: 32px; border: 1px solid #e2e8f0; border-top: 4px solid #10b981; border-radius: 0 0 12px 12px;">
    <div style="background: #d1fae515; border: 1px solid #10b98130; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
      <strong style="color: #10b981;">Case Resolved — #${caseId}</strong>
    </div>
    <h2 style="color: #1a1a2e;">Your case has been resolved.</h2>
    <p style="color: #475569; line-height: 1.6;"><strong>Resolution Summary:</strong><br>${resolution}</p>
    <p style="color: #94a3b8; font-size: 13px; margin-top: 24px;">Resolved by: ${analystName}</p>
  </div>
</body>
</html>`;

  return { subject, html, text: `Case #${caseId} Resolved\n\n${resolution}\n\nResolved by: ${analystName}` };
}
