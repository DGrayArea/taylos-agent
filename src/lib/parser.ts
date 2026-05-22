// src/app/lib/parser.ts
// PURPOSE: Extract structured text from uploaded files.
// This runs BEFORE the AI — it converts raw file bytes into readable text.
//
// WHAT YOU NEED TO DO:
// Choose a PDF parsing library and install it.
// Recommended options:
//   - pnpm add pdf-parse       (simple, works serverside)
//   - pnpm add @unstructured/client  (powerful, needs API key)
//   - pnpm add pdfjs-dist      (browser + server)
//
// For CSV, no library needed — it's plain text.

// ─────────────────────────────────────────────────────────────
// PDF Text Extraction
// ─────────────────────────────────────────────────────────────

/**
 * Extracts raw text from a PDF buffer.
 * TODO: Install pdf-parse and uncomment.
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Import the parser directly to bypass pdf-parse's internal test runner,
  // which tries to open './test/data/05-versions-space.pdf' on module load.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (
    buf: Buffer,
  ) => Promise<{ text: string }>;
  const data = await pdfParse(buffer);
  return data.text;
}

// ─────────────────────────────────────────────────────────────
// CSV Text Extraction
// ─────────────────────────────────────────────────────────────

/**
 * Parses a CSV buffer into an array of row objects.
 * No library needed — splits by newline and comma.
 */
export function parseCSV(buffer: Buffer): Record<string, string>[] {
  const text = buffer.toString("utf-8");
  const lines = text.trim().split("\n");

  if (lines.length < 2) return [];

  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().replace(/^"|"$/g, ""));

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

// ─────────────────────────────────────────────────────────────
// Excel Text & Data Extraction
// ─────────────────────────────────────────────────────────────

/**
 * Parses an Excel buffer (.xlsx, .xls) into structured rows and CSV-style text.
 */
export function parseExcel(buffer: Buffer): {
  structuredData: Array<Record<string, unknown>>;
  csvText: string;
} {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const XLSX = require("xlsx");
  const workbook = XLSX.read(buffer, { type: "buffer" });
  if (workbook.SheetNames.length === 0) {
    return { structuredData: [], csvText: "" };
  }
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert worksheet to an array of objects
  const structuredData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

  // Convert worksheet to a CSV formatted string to serve as raw_text
  const csvText = XLSX.utils.sheet_to_csv(worksheet);

  return { structuredData, csvText };
}

// ─────────────────────────────────────────────────────────────
// Detect File Type
// ─────────────────────────────────────────────────────────────

/**
 * Determines the document category from its filename.
 */
export function detectDocumentType(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes("statement") || lower.includes("bank"))
    return "bank_statement";
  if (lower.includes("invoice") || lower.includes("receipt")) return "invoice";
  if (lower.includes("complaint") || lower.includes("support"))
    return "customer_complaint";
  if (lower.includes("log") || lower.includes("history"))
    return "transaction_log";
  return "unknown";
}
