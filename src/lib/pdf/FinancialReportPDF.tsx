// src/lib/pdf/FinancialReportPDF.tsx
// PURPOSE: @react-pdf/renderer template for the financial analysis report.
// Produces a clean, professional PDF with all findings explained in plain English.

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { Anomaly, ComprehensiveAnalysis, ReportHistoryRow } from "@/lib/types";

// ─── Colour palette ────────────────────────────────────────
const NAVY = "#0a1628";
const GOLD = "#d4af37";
const GOLD_LIGHT = "#c9a961";
const CRITICAL = "#ef4444";
const WARNING = "#f59e0b";
const SUCCESS = "#10b981";
const CHARCOAL = "#1a2332";
const LIGHT_GREY = "#f3f4f6";
const MID_GREY = "#6b7280";

// ─── Severity helpers ──────────────────────────────────────
const severityColor: Record<string, string> = {
  CRITICAL: CRITICAL,
  HIGH: WARNING,
  MEDIUM: GOLD,
  LOW: SUCCESS,
  INFORMATIONAL: MID_GREY,
};

const severityLabel: Record<string, string> = {
  CRITICAL: "Critical",
  HIGH: "High Priority",
  MEDIUM: "Medium",
  LOW: "Low",
  INFORMATIONAL: "For Information",
};

const anomalyTypeLabel: Record<string, string> = {
  DUPLICATE_TRANSACTION: "Duplicate Payment",
  DUPLICATE_CHARGE: "Duplicate Charge",
  UNUSUAL_PATTERN: "Unusual Activity",
  MISSING_RECEIPT: "Missing Receipt",
  SYSTEM_SYNC_DELAY: "Processing Delay",
  FRAUD: "Possible Fraud",
  BILLING_ERROR: "Billing Error",
  CUSTOMER_ERROR: "Data Entry Error",
  SYSTEM_GLITCH: "System Delay",
  SELF_APPROVAL: "Self-Approval Violation",
  GHOST_VENDOR: "Unrecognised Vendor",
  SPLIT_TRANSACTION: "Split Payment",
  OFFSHORE_TRANSFER: "Offshore Transfer",
  PAYROLL_ANOMALY: "Payroll Irregularity",
  MISSING_DOCUMENTATION: "Missing Documentation",
  VELOCITY_ANOMALY: "Unusual Volume",
};

function fmtNaira(amount: number | string | null | undefined): string {
  const n = typeof amount === "string" ? parseFloat(amount) : (amount ?? 0);
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(n || 0);
}

function fmtDate(dateStr: string): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ─── Styles ────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    paddingTop: 0,
    paddingBottom: 40,
    paddingHorizontal: 0,
  },
  // Header band
  headerBand: {
    backgroundColor: NAVY,
    paddingHorizontal: 40,
    paddingTop: 32,
    paddingBottom: 24,
    marginBottom: 0,
  },
  headerLogoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLogoBox: {
    width: 32,
    height: 32,
    backgroundColor: GOLD,
    borderRadius: 6,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  headerLogoText: { color: NAVY, fontSize: 14, fontFamily: "Helvetica-Bold" },
  headerBrandName: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  headerSubtitle: { color: GOLD_LIGHT, fontSize: 11 },
  headerMeta: { color: "#9ca3af", fontSize: 9, marginTop: 12 },
  // Gold divider
  goldBar: { height: 4, backgroundColor: GOLD },
  // Content area
  content: { paddingHorizontal: 40, paddingTop: 24 },
  // Section
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_GREY,
    paddingBottom: 6,
  },
  sectionBlock: { marginBottom: 24 },
  // Summary box
  summaryBox: {
    backgroundColor: "#f8fafc",
    borderLeftWidth: 4,
    borderLeftColor: GOLD,
    padding: 14,
    borderRadius: 4,
    marginBottom: 16,
  },
  summaryText: { fontSize: 11, color: "#1f2937", lineHeight: 1.6 },
  summaryLabel: {
    fontSize: 9,
    color: MID_GREY,
    marginBottom: 4,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  // Stats row
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statBox: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
  },
  statNum: { fontSize: 22, fontFamily: "Helvetica-Bold", color: NAVY },
  statLabel: {
    fontSize: 8,
    color: MID_GREY,
    marginTop: 2,
    textAlign: "center",
  },
  // Anomaly card
  anomalyCard: {
    borderRadius: 6,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: LIGHT_GREY,
  },
  anomalyHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
  },
  anomalyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  anomalyBadgeText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#fff",
  },
  anomalyTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    flex: 1,
  },
  anomalyBody: { paddingHorizontal: 12, paddingBottom: 12 },
  anomalyDesc: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.6,
    marginBottom: 8,
  },
  anomalyFieldRow: { flexDirection: "row", marginBottom: 4 },
  anomalyFieldLabel: {
    fontSize: 9,
    color: MID_GREY,
    width: 110,
    fontFamily: "Helvetica-Bold",
  },
  anomalyFieldValue: { fontSize: 9, color: "#1f2937", flex: 1 },
  evidenceBullet: { flexDirection: "row", marginBottom: 3 },
  evidenceDot: { width: 12, fontSize: 9, color: GOLD },
  evidenceText: { fontSize: 9, color: "#374151", flex: 1 },
  // Action box
  actionBox: {
    backgroundColor: "#fef3c7",
    borderLeftWidth: 4,
    borderLeftColor: WARNING,
    padding: 12,
    borderRadius: 4,
    marginTop: 8,
  },
  actionLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#92400e",
    marginBottom: 4,
  },
  actionText: { fontSize: 10, color: "#78350f" },
  // Step list
  stepRow: { flexDirection: "row", marginBottom: 6 },
  stepNum: {
    width: 20,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: GOLD,
  },
  stepText: { fontSize: 10, color: "#374151", flex: 1, lineHeight: 1.5 },
  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: LIGHT_GREY,
    paddingTop: 8,
  },
  footerText: { fontSize: 8, color: MID_GREY },
  // Severity summary
  sevRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  sevBox: { flex: 1, padding: 10, borderRadius: 6, alignItems: "center" },
  sevNum: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#fff" },
  sevLabel: { fontSize: 8, color: "#fff", opacity: 0.85, marginTop: 2 },
  // Confidence chip
  confidenceChip: {
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: SUCCESS,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  confidenceChipText: {
    fontSize: 9,
    color: "#065f46",
    fontFamily: "Helvetica-Bold",
  },
  // Info row
  infoRow: { flexDirection: "row", gap: 16, marginBottom: 16 },
  infoBox: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 6,
  },
  infoLabel: {
    fontSize: 9,
    color: MID_GREY,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  infoValue: { fontSize: 11, color: "#111827", fontFamily: "Helvetica-Bold" },
  // Who to notify
  notifyBox: {
    backgroundColor: "#eff6ff",
    borderLeftWidth: 3,
    borderLeftColor: "#3b82f6",
    padding: 12,
    borderRadius: 4,
    marginBottom: 12,
  },
  notifyLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#1e40af",
    marginBottom: 4,
  },
  notifyText: { fontSize: 10, color: "#1e3a8a" },
});

// ─── Component ────────────────────────────────────────────
type ReportInput = ComprehensiveAnalysis | ReportHistoryRow;

interface Props {
  report: ReportInput;
}

function isReportHistoryRow(value: ReportInput): value is ReportHistoryRow {
  return typeof value === "object" && value !== null && "data" in value;
}

export function FinancialReportPDF({ report }: Props) {
  const analysis = isReportHistoryRow(report) ? report.data : report;
  const dbId = isReportHistoryRow(report) ? report.id : undefined;
  const createdAt = isReportHistoryRow(report)
    ? (report.created_at ?? analysis.analysis_metadata.analysis_date)
    : analysis.analysis_metadata.analysis_date;

  const meta = analysis?.analysis_metadata ?? {};
  const summary = analysis?.executive_summary ?? {};
  const anomalies = (analysis?.feature_2_anomalies?.anomaly_list ??
    []) as Anomaly[];
  const bySeverity = analysis?.feature_2_anomalies?.anomalies_by_severity ?? {};
  const recommendations = analysis?.recommendations ?? {};

  const reportDate = fmtDate(createdAt);
  const refId = dbId ? dbId.substring(0, 8).toUpperCase() : "—";

  const criticalAndHigh = anomalies.filter(
    (a) => a.severity === "CRITICAL" || a.severity === "HIGH",
  );
  const others = anomalies.filter(
    (a) => a.severity !== "CRITICAL" && a.severity !== "HIGH",
  );

  return (
    <Document
      title={`Taylos Financial Review Report — ${refId}`}
      author="Taylos Finance Platform"
      subject="Financial Analysis Report"
      creator="Taylos Finance"
    >
      {/* ── Page 1: Cover + Executive Summary ── */}
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.headerBand}>
          <View style={s.headerLogoRow}>
            <View style={s.headerLogoBox}>
              <Text style={s.headerLogoText}>T</Text>
            </View>
            <Text style={s.headerBrandName}>Taylos Finance</Text>
          </View>
          <Text style={s.headerTitle}>Financial Review Report</Text>
          <Text style={s.headerSubtitle}>
            Automated Document Analysis &amp; Anomaly Detection
          </Text>
          <Text style={s.headerMeta}>
            Reference: {refId}
            {"   "}|{"   "}Date: {reportDate}
            {"   "}|{"   "}
            Documents: {meta.documents_processed ?? 0}
            {"   "}|{"   "}
            Version: {meta.analysis_version ?? "3.0-AI"}
          </Text>
        </View>
        <View style={s.goldBar} />

        <View style={s.content}>
          {/* Stats */}
          <View style={[s.statsRow, { marginTop: 20 }]}>
            <View style={s.statBox}>
              <Text style={s.statNum}>{meta.documents_processed ?? 0}</Text>
              <Text style={s.statLabel}>Documents{"\n"}Reviewed</Text>
            </View>
            <View style={s.statBox}>
              <Text style={s.statNum}>
                {meta.total_transactions_analyzed ?? 0}
              </Text>
              <Text style={s.statLabel}>Records{"\n"}Checked</Text>
            </View>
            <View style={s.statBox}>
              <Text
                style={[
                  s.statNum,
                  { color: anomalies.length > 0 ? CRITICAL : SUCCESS },
                ]}
              >
                {anomalies.length}
              </Text>
              <Text style={s.statLabel}>Issues{"\n"}Found</Text>
            </View>
            <View style={s.statBox}>
              <Text style={s.statNum}>
                {meta.data_quality_score
                  ? `${Math.round(meta.data_quality_score * 100)}%`
                  : "—"}
              </Text>
              <Text style={s.statLabel}>Data{"\n"}Quality</Text>
            </View>
          </View>

          {/* Severity breakdown */}
          <View style={s.sevRow}>
            <View style={[s.sevBox, { backgroundColor: CRITICAL }]}>
              <Text style={s.sevNum}>{bySeverity.critical ?? 0}</Text>
              <Text style={s.sevLabel}>Critical</Text>
            </View>
            <View style={[s.sevBox, { backgroundColor: WARNING }]}>
              <Text style={s.sevNum}>{bySeverity.high ?? 0}</Text>
              <Text style={s.sevLabel}>High Priority</Text>
            </View>
            <View style={[s.sevBox, { backgroundColor: GOLD }]}>
              <Text style={s.sevNum}>{bySeverity.medium ?? 0}</Text>
              <Text style={s.sevLabel}>Medium</Text>
            </View>
            <View style={[s.sevBox, { backgroundColor: SUCCESS }]}>
              <Text style={s.sevNum}>{bySeverity.low ?? 0}</Text>
              <Text style={s.sevLabel}>Low</Text>
            </View>
          </View>

          {/* Executive Summary */}
          <View style={s.sectionBlock}>
            <Text style={s.sectionTitle}>Executive Summary</Text>
            {summary.finding ? (
              <View style={s.summaryBox}>
                <Text style={s.summaryLabel}>What We Found</Text>
                <Text style={s.summaryText}>{summary.finding}</Text>
              </View>
            ) : null}
            {summary.root_cause ? (
              <View style={[s.summaryBox, { borderLeftColor: WARNING }]}>
                <Text style={s.summaryLabel}>Likely Cause</Text>
                <Text style={s.summaryText}>{summary.root_cause}</Text>
              </View>
            ) : null}
            {summary.recommended_action ? (
              <View style={[s.actionBox]}>
                <Text style={s.actionLabel}>Recommended Action</Text>
                <Text style={s.actionText}>{summary.recommended_action}</Text>
              </View>
            ) : null}
            {summary.confidence ? (
              <View style={s.confidenceChip}>
                <Text style={s.confidenceChipText}>
                  Confidence: {summary.confidence}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Analysis metadata */}
          <View style={s.sectionBlock}>
            <Text style={s.sectionTitle}>Review Details</Text>
            <View style={s.infoRow}>
              <View style={s.infoBox}>
                <Text style={s.infoLabel}>Processing Time</Text>
                <Text style={s.infoValue}>
                  {meta.total_processing_time_seconds
                    ? `${meta.total_processing_time_seconds}s`
                    : "—"}
                </Text>
              </View>
              <View style={s.infoBox}>
                <Text style={s.infoLabel}>Priority Level</Text>
                <Text
                  style={[
                    s.infoValue,
                    { color: severityColor[summary.priority] ?? NAVY },
                  ]}
                >
                  {severityLabel[summary.priority] ?? summary.priority ?? "—"}
                </Text>
              </View>
              <View style={s.infoBox}>
                <Text style={s.infoLabel}>Review Date</Text>
                <Text style={s.infoValue}>{reportDate}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            Taylos Finance Platform — Confidential
          </Text>
          <Text style={s.footerText}>
            Generated: {new Date().toLocaleDateString("en-GB")}
          </Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>

      {/* ── Page 2+: Critical & High Issues ── */}
      {criticalAndHigh.length > 0 && (
        <Page size="A4" style={s.page}>
          <View style={s.headerBand}>
            <Text style={s.headerTitle}>
              Issues Requiring Immediate Attention
            </Text>
            <Text style={s.headerSubtitle}>
              Critical and High Priority findings from your documents
            </Text>
          </View>
          <View style={s.goldBar} />

          <View style={s.content}>
            {criticalAndHigh.map((anomaly: Anomaly, i: number) => {
              const sev = (anomaly.severity ?? "MEDIUM").toUpperCase();
              const color = severityColor[sev] ?? MID_GREY;
              const typeLabel =
                anomalyTypeLabel[
                  (anomaly.type ?? "").toUpperCase().replace(/ /g, "_")
                ] ?? anomaly.type;

              return (
                <View key={anomaly.id ?? i} style={s.anomalyCard}>
                  <View
                    style={[s.anomalyHeader, { backgroundColor: color + "15" }]}
                  >
                    <View style={[s.anomalyBadge, { backgroundColor: color }]}>
                      <Text style={s.anomalyBadgeText}>
                        {severityLabel[sev] ?? sev}
                      </Text>
                    </View>
                    <Text style={s.anomalyTitle}>{typeLabel}</Text>
                    <Text style={{ fontSize: 9, color: MID_GREY }}>
                      Risk Score: {anomaly.anomaly_score ?? "—"}/100
                    </Text>
                  </View>
                  <View style={s.anomalyBody}>
                    <Text style={s.anomalyDesc}>{anomaly.description}</Text>

                    <View style={s.anomalyFieldRow}>
                      <Text style={s.anomalyFieldLabel}>Amount at Risk:</Text>
                      <Text
                        style={[
                          s.anomalyFieldValue,
                          { color: CRITICAL, fontFamily: "Helvetica-Bold" },
                        ]}
                      >
                        {anomaly.financial_impact ??
                          (anomaly.affected_amounts?.[0]
                            ? fmtNaira(anomaly.affected_amounts[0])
                            : "To be determined")}
                      </Text>
                    </View>

                    {anomaly.first_occurrence && (
                      <View style={s.anomalyFieldRow}>
                        <Text style={s.anomalyFieldLabel}>Date of Issue:</Text>
                        <Text style={s.anomalyFieldValue}>
                          {fmtDate(anomaly.first_occurrence)}
                        </Text>
                      </View>
                    )}

                    {anomaly.related_documents?.length > 0 && (
                      <View style={s.anomalyFieldRow}>
                        <Text style={s.anomalyFieldLabel}>Found In:</Text>
                        <Text style={s.anomalyFieldValue}>
                          {anomaly.related_documents.join(", ")}
                        </Text>
                      </View>
                    )}

                    {anomaly.business_impact && (
                      <View style={s.anomalyFieldRow}>
                        <Text style={s.anomalyFieldLabel}>
                          Business Impact:
                        </Text>
                        <Text style={s.anomalyFieldValue}>
                          {anomaly.business_impact}
                        </Text>
                      </View>
                    )}

                    {anomaly.evidence_points?.length > 0 && (
                      <View style={{ marginTop: 8 }}>
                        <Text style={[s.summaryLabel, { marginBottom: 6 }]}>
                          Supporting Evidence:
                        </Text>
                        {anomaly.evidence_points.map(
                          (ev: string, j: number) => (
                            <View key={j} style={s.evidenceBullet}>
                              <Text style={s.evidenceDot}>•</Text>
                              <Text style={s.evidenceText}>{ev}</Text>
                            </View>
                          ),
                        )}
                      </View>
                    )}

                    {anomaly.recommended_action && (
                      <View style={s.actionBox}>
                        <Text style={s.actionLabel}>What to Do</Text>
                        <Text style={s.actionText}>
                          {anomaly.recommended_action}
                        </Text>
                      </View>
                    )}

                    <View style={{ marginTop: 6 }}>
                      <Text style={s.anomalyFieldLabel}>
                        Confidence: {anomaly.confidence ?? "—"}%
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={s.footer} fixed>
            <Text style={s.footerText}>
              Taylos Finance Platform — Confidential
            </Text>
            <Text style={s.footerText}>
              Generated: {new Date().toLocaleDateString("en-GB")}
            </Text>
            <Text
              style={s.footerText}
              render={({ pageNumber, totalPages }) =>
                `Page ${pageNumber} of ${totalPages}`
              }
            />
          </View>
        </Page>
      )}

      {/* ── Page 3+: Medium & Low Issues ── */}
      {others.length > 0 && (
        <Page size="A4" style={s.page}>
          <View style={s.headerBand}>
            <Text style={s.headerTitle}>Additional Findings</Text>
            <Text style={s.headerSubtitle}>
              Medium and low priority items for your review
            </Text>
          </View>
          <View style={s.goldBar} />

          <View style={s.content}>
            {others.map((anomaly: Anomaly, i: number) => {
              const sev = (anomaly.severity ?? "LOW").toUpperCase();
              const color = severityColor[sev] ?? MID_GREY;
              const typeLabel =
                anomalyTypeLabel[
                  (anomaly.type ?? "").toUpperCase().replace(/ /g, "_")
                ] ?? anomaly.type;

              return (
                <View key={anomaly.id ?? i} style={s.anomalyCard}>
                  <View
                    style={[s.anomalyHeader, { backgroundColor: color + "15" }]}
                  >
                    <View style={[s.anomalyBadge, { backgroundColor: color }]}>
                      <Text style={s.anomalyBadgeText}>
                        {severityLabel[sev] ?? sev}
                      </Text>
                    </View>
                    <Text style={s.anomalyTitle}>{typeLabel}</Text>
                    <Text style={{ fontSize: 9, color: MID_GREY }}>
                      Risk Score: {anomaly.anomaly_score ?? "—"}/100
                    </Text>
                  </View>
                  <View style={s.anomalyBody}>
                    <Text style={s.anomalyDesc}>{anomaly.description}</Text>
                    {anomaly.related_documents?.length > 0 && (
                      <View style={s.anomalyFieldRow}>
                        <Text style={s.anomalyFieldLabel}>Found In:</Text>
                        <Text style={s.anomalyFieldValue}>
                          {anomaly.related_documents.join(", ")}
                        </Text>
                      </View>
                    )}
                    {anomaly.evidence_points?.length > 0 && (
                      <View style={{ marginTop: 6 }}>
                        <Text style={[s.summaryLabel, { marginBottom: 4 }]}>
                          Evidence:
                        </Text>
                        {anomaly.evidence_points
                          .slice(0, 2)
                          .map((ev: string, j: number) => (
                            <View key={j} style={s.evidenceBullet}>
                              <Text style={s.evidenceDot}>•</Text>
                              <Text style={s.evidenceText}>{ev}</Text>
                            </View>
                          ))}
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          <View style={s.footer} fixed>
            <Text style={s.footerText}>
              Taylos Finance Platform — Confidential
            </Text>
            <Text style={s.footerText}>
              Generated: {new Date().toLocaleDateString("en-GB")}
            </Text>
            <Text
              style={s.footerText}
              render={({ pageNumber, totalPages }) =>
                `Page ${pageNumber} of ${totalPages}`
              }
            />
          </View>
        </Page>
      )}

      {/* ── Final Page: Recommendations ── */}
      <Page size="A4" style={s.page}>
        <View style={s.headerBand}>
          <Text style={s.headerTitle}>
            Recommended Actions &amp; Next Steps
          </Text>
          <Text style={s.headerSubtitle}>
            Follow these steps to address the findings in this report
          </Text>
        </View>
        <View style={s.goldBar} />

        <View style={s.content}>
          {/* Primary recommendation */}
          {recommendations.primary_recommendation && (
            <View style={s.sectionBlock}>
              <Text style={s.sectionTitle}>Primary Action</Text>
              <View style={[s.summaryBox, { borderLeftColor: CRITICAL }]}>
                <Text style={s.summaryText}>
                  {recommendations.primary_recommendation}
                </Text>
              </View>
            </View>
          )}

          {/* Step-by-step */}
          {recommendations.secondary_actions?.length > 0 && (
            <View style={s.sectionBlock}>
              <Text style={s.sectionTitle}>Step-by-Step Actions</Text>
              {recommendations.secondary_actions.map(
                (action: string, i: number) => (
                  <View key={i} style={s.stepRow}>
                    <Text style={s.stepNum}>{i + 1}.</Text>
                    <Text style={s.stepText}>{action}</Text>
                  </View>
                ),
              )}
            </View>
          )}

          {/* Who to notify */}
          {recommendations.communication && (
            <View style={s.sectionBlock}>
              <Text style={s.sectionTitle}>Who to Notify</Text>
              <View style={s.notifyBox}>
                <Text style={s.notifyLabel}>Escalation Guidance</Text>
                <Text style={s.notifyText}>
                  {recommendations.communication}
                </Text>
              </View>
            </View>
          )}

          {/* Next steps */}
          {summary.next_steps && (
            <View style={s.sectionBlock}>
              <Text style={s.sectionTitle}>Follow-Up Actions</Text>
              <View style={[s.summaryBox, { borderLeftColor: SUCCESS }]}>
                <Text style={s.summaryText}>{summary.next_steps}</Text>
              </View>
            </View>
          )}

          {/* Timeline */}
          {recommendations.timeline && (
            <View style={s.infoRow}>
              <View
                style={[
                  s.infoBox,
                  { borderWidth: 1, borderColor: GOLD + "60" },
                ]}
              >
                <Text style={s.infoLabel}>Timeline</Text>
                <Text style={[s.infoValue, { color: GOLD }]}>
                  {recommendations.timeline}
                </Text>
              </View>
              <View style={[s.infoBox, { flex: 2 }]}>
                <Text style={s.infoLabel}>Follow-up</Text>
                <Text style={s.infoValue}>
                  {recommendations.follow_up || "—"}
                </Text>
              </View>
            </View>
          )}

          {/* Disclaimer */}
          <View
            style={{
              marginTop: 32,
              padding: 12,
              backgroundColor: "#f9fafb",
              borderRadius: 4,
            }}
          >
            <Text style={{ fontSize: 8, color: MID_GREY, lineHeight: 1.6 }}>
              DISCLAIMER: This report was generated by the Taylos Finance
              automated analysis platform. Findings are based on the documents
              submitted and AI pattern recognition. This report should be
              reviewed by a qualified finance professional before any action is
              taken. Taylos Finance accepts no liability for decisions made
              solely on the basis of this automated analysis.
            </Text>
          </View>
        </View>

        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            Taylos Finance Platform — Confidential
          </Text>
          <Text style={s.footerText}>
            Generated: {new Date().toLocaleDateString("en-GB")}
          </Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
