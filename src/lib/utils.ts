import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as XLSX from "xlsx";
import { ComprehensiveAnalysis } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNaira(amount: number | string | null | undefined) {
  const value =
    typeof amount === "string"
      ? Number(amount.toString().replace(/[^0-9.-]+/g, ""))
      : (amount ?? 0);
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(value);
}

export function getDocumentNamesFromAnalysis(
  analysis: ComprehensiveAnalysis | null | undefined,
) {
  if (!analysis) return [];

  const documentNames = new Set<string>();
  const add = (name?: string) => {
    if (name?.trim()) documentNames.add(name.trim());
  };

  const transactions =
    analysis.feature_1_data_intake?.unified_data?.transactions ?? [];
  const invoices = analysis.feature_1_data_intake?.unified_data?.invoices ?? [];
  const complaints =
    analysis.feature_1_data_intake?.unified_data?.complaints ?? [];
  const anomalyRelated = analysis.feature_2_anomalies?.anomaly_list ?? [];

  transactions.forEach((item) => add(item.source_document));
  invoices.forEach((item) => add(item.source_document));
  complaints.forEach((item) => add(item.source_document));
  anomalyRelated.forEach((item) => {
    if (Array.isArray(item.related_documents)) {
      item.related_documents.forEach((name) => add(name));
    }
  });

  const topLevelNames = analysis.source_documents;
  if (Array.isArray(topLevelNames)) {
    topLevelNames.forEach((name) => add(name));
  }

  return Array.from(documentNames).slice(0, 8);
}

export function exportAnomaliesToExcel(
  analysis: ComprehensiveAnalysis | null | undefined,
  filename: string,
) {
  if (!analysis?.feature_2_anomalies?.anomaly_list) return;

  const anomalies = analysis.feature_2_anomalies.anomaly_list.map((a) => ({
    ID: a.id,
    Category: a.category,
    Type: a.type,
    Severity: a.severity,
    Description: a.description,
    "Confidence (%)": a.confidence,
    "Affected Amount (NGN)": a.affected_amounts?.[0] || 0,
    "Related Documents": a.related_documents?.join(", ") || "",
    "System Detected": a.system_detected ? "Yes" : "No",
  }));

  const worksheet = XLSX.utils.json_to_sheet(anomalies);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Anomalies");

  XLSX.writeFile(workbook, filename);
}
