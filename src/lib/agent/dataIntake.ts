import {
  MasterUnifiedModel,
  RawDocumentPayload,
  UnifiedTransaction,
  UnifiedInvoice,
  UnifiedComplaint,
  DocumentSourceType,
} from "../types";
import {
  normalizeDate,
  normalizeMerchant,
  normalizeAmountAndDirection,
} from "./normalizers";
import { detectAnomalies } from "./detector";

/**
 * Categorizes a document based on filename, mime type, and content.
 */
function categorizeDocument(doc: RawDocumentPayload): DocumentSourceType {
  const name = doc.filename.toLowerCase();
  if (name.includes("statement") || name.includes("bank"))
    return "bank_statement";
  if (name.includes("invoice") || name.includes("receipt")) return "invoice";
  if (name.includes("log") || name.includes("history"))
    return "transaction_log";
  if (name.includes("complaint") || name.includes("support"))
    return "customer_complaint";
  return "unknown";
}

/**
 * Extracts and unifies data from an array of raw document payloads.
 * This simulates the agentic behavior of parsing disparate data sources
 * and consolidating them into the MasterUnifiedModel.
 */
export function processFinancialData(
  payloads: RawDocumentPayload[],
): MasterUnifiedModel {
  const transactions: UnifiedTransaction[] = [];
  const invoices: UnifiedInvoice[] = [];
  const complaints: UnifiedComplaint[] = [];

  let bankStatementCount = 0;
  let totalInflow = 0;
  let totalOutflow = 0;

  let invoiceCount = 0;
  let invoiceTotal = 0;
  const invoiceVendors = new Set<string>();

  let complaintCount = 0;
  const complaintIssues = new Set<string>();

  const dataGaps: string[] = [];
  const parsingIssues: string[] = [];

  // Process each document
  payloads.forEach((doc) => {
    const type = categorizeDocument(doc);

    // In a real system, we would run OCR or NLP extraction here.
    // Since we are simulating the OCR step, we assume the frontend
    // passed `structured_data` if it was a CSV/JSON, or we extract
    // dummy entities based on the document type.

    if (type === "bank_statement" || type === "transaction_log") {
      bankStatementCount++;
      if (doc.structured_data && Array.isArray(doc.structured_data)) {
        doc.structured_data.forEach((row, index) => {
          const record = row as Record<string, unknown>;
          const rawAmount = record.amount ?? record.value;
          const rawDate = record.date ?? record.timestamp;
          const rawMerchant = record.merchant ?? record.description;
          const rawId = record.id ?? `txn_${Date.now()}_${index}`;

          if (rawAmount === undefined || rawAmount === null) {
            parsingIssues.push(
              `Missing critical field: AMOUNT in ${doc.filename} row ${index + 1}`,
            );
          }
          if (rawDate === undefined || rawDate === null) {
            parsingIssues.push(
              `Missing critical field: DATE in ${doc.filename} row ${index + 1}`,
            );
          }

          const { amount, direction } = normalizeAmountAndDirection(
            rawAmount,
            typeof record.type === "string" ? record.type : undefined,
          );

          if (direction === "credit") totalInflow += amount;
          else totalOutflow += amount;

          transactions.push({
            id:
              typeof rawId === "string" ? rawId : `txn_${Date.now()}_${index}`,
            date: normalizeDate(
              typeof rawDate === "string" ? rawDate : new Date().toISOString(),
            ),
            amount,
            direction,
            merchant: normalizeMerchant(
              typeof rawMerchant === "string"
                ? rawMerchant
                : String(rawMerchant ?? ""),
            ),
            source_document: doc.filename,
            source_line: index + 1,
            confidence: 0.95,
          });
        });
      } else {
        dataGaps.push(`Empty or invalid structured data for ${doc.filename}`);
      }
    } else if (type === "invoice") {
      invoiceCount++;
      if (doc.structured_data && Array.isArray(doc.structured_data)) {
        doc.structured_data.forEach((row, index) => {
          const record = row as Record<string, unknown>;
          const rawVendor = record.vendor;
          const rawAmount = record.amount ?? record.total;
          const rawDate = record.date ?? record.issue_date;
          const rawDueDate = record.due_date;
          const rawStatus =
            typeof record.status === "string"
              ? record.status.toLowerCase()
              : "";
          const rawInvoiceId = record.invoice_id;

          if (!rawVendor)
            parsingIssues.push(
              `Missing critical field: VENDOR in ${doc.filename} row ${index + 1}`,
            );

          const vendorName = normalizeMerchant(
            typeof rawVendor === "string" ? rawVendor : String(rawVendor ?? ""),
          );
          invoiceVendors.add(vendorName);
          const { amount } = normalizeAmountAndDirection(rawAmount, undefined);
          invoiceTotal += amount;

          invoices.push({
            id:
              typeof rawInvoiceId === "string"
                ? rawInvoiceId
                : `inv_${Date.now()}_${index}`,
            date: normalizeDate(
              typeof rawDate === "string" ? rawDate : new Date().toISOString(),
            ),
            amount,
            vendor: vendorName,
            due_date: normalizeDate(
              typeof rawDueDate === "string"
                ? rawDueDate
                : new Date().toISOString(),
            ),
            status: rawStatus === "paid" ? "paid" : "pending",
          });
        });
      } else {
        dataGaps.push(`No structured items found for invoice ${doc.filename}`);
      }
    } else if (type === "customer_complaint") {
      complaintCount++;
      if (!doc.raw_text || doc.raw_text.length < 10) {
        dataGaps.push(
          `Complaint document ${doc.filename} is too short or empty`,
        );
      }

      const sentiment =
        doc.raw_text.toLowerCase().includes("angry") ||
        doc.raw_text.toLowerCase().includes("double")
          ? "frustrated"
          : "neutral";
      if (
        doc.raw_text.toLowerCase().includes("double") ||
        doc.raw_text.toLowerCase().includes("duplicate")
      ) {
        complaintIssues.add("duplicate charge");
      }

      complaints.push({
        text:
          doc.raw_text.substring(0, 200) +
          (doc.raw_text.length > 200 ? "..." : ""),
        date_filed: normalizeDate(new Date().toISOString()),
        sentiment,
        mentions: Array.from(complaintIssues),
        source_document: doc.filename,
      });
    }
  });

  // Calculate Data Quality Metrics
  const totalProcessed =
    transactions.length + invoices.length + complaints.length;
  // Base confidence starts at 100%, degrades for missing/unknown data
  let dataQualityScore = 1.0;

  if (totalProcessed === 0) {
    dataQualityScore = 0;
    parsingIssues.push("No extractable data found in payloads.");
  }

  // Build the Unified Model
  const unifiedModel: MasterUnifiedModel = {
    unified_data: {
      documents_processed: {},
      transactions,
      invoices,
      complaints,
      metadata: {
        analysis_date: new Date().toISOString().split("T")[0],
        data_quality_score: Math.max(0, dataQualityScore),
        parsing_issues: parsingIssues,
        data_gaps: dataGaps,
      },
    },
  };

  // Run Anomaly Detection
  unifiedModel.unified_data.anomalies = detectAnomalies(unifiedModel);

  // Populate documents_processed metrics
  if (bankStatementCount > 0) {
    unifiedModel.unified_data.documents_processed.bank_statements = {
      count: bankStatementCount,
      date_range: "Extracted from transactions",
      transactions_extracted: transactions.length,
      total_inflow: totalInflow,
      total_outflow: totalOutflow,
    };
  }

  if (invoiceCount > 0) {
    unifiedModel.unified_data.documents_processed.invoices = {
      count: invoiceCount,
      total_amount: invoiceTotal,
      vendors: Array.from(invoiceVendors),
    };
  }

  if (complaintCount > 0) {
    unifiedModel.unified_data.documents_processed.customer_complaints = {
      count: complaintCount,
      sentiment: "Mixed",
      key_issues: Array.from(complaintIssues),
    };
  }

  return unifiedModel;
}
