import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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

export function getDocumentNamesFromAnalysis(analysis: any) {
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

  transactions.forEach((item: any) => add(item.source_document));
  invoices.forEach((item: any) => add(item.source_document));
  complaints.forEach((item: any) => add(item.source_document));
  anomalyRelated.forEach((item: any) => {
    if (Array.isArray(item.related_documents)) {
      item.related_documents.forEach((name: string) => add(name));
    }
  });

  const topLevelNames = analysis.source_documents;
  if (Array.isArray(topLevelNames)) {
    topLevelNames.forEach((name: string) => add(name));
  }

  return Array.from(documentNames).slice(0, 8);
}
