// Basic agentic normalizers

/**
 * Converts various date formats into YYYY-MM-DD
 */
export function normalizeDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split("T")[0];

  // Try to parse using native Date.
  // Note: This is simplified. A real agent would use NLP (e.g. "March 15th, 2024")
  // or a robust library like date-fns/moment to handle edge cases.
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split("T")[0];
  }

  // Fallback if parsing fails
  return new Date().toISOString().split("T")[0];
}

/**
 * Standardizes merchant names by making them title case,
 * removing trailing domains, and consolidating common names.
 */
export function normalizeMerchant(merchantStr: string): string {
  if (!merchantStr) return "Unknown Merchant";

  let cleaned = merchantStr.trim().toUpperCase();

  // Rules engine for common merchants
  if (cleaned.includes("AMZN") || cleaned.includes("AMAZON")) return "Amazon";
  if (cleaned.includes("UBER") || cleaned.includes("UBR")) return "Uber";
  if (cleaned.includes("STARBUCKS") || cleaned.includes("SBUX"))
    return "Starbucks";
  if (cleaned.includes("APPLE") || cleaned.includes("AAPL")) return "Apple";

  // Generic cleanup: Remove .COM, INC, LLC
  cleaned = cleaned
    .replace(/\.COM/g, "")
    .replace(/ INC\.?/g, "")
    .replace(/ LLC\.?/g, "");

  // Convert to Title Case
  return cleaned
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Normalizes an amount and determines its direction.
 * In a real scenario, this would parse text like "-$50.00" or "50.00 CR".
 */
export function normalizeAmountAndDirection(
  amountRaw: unknown,
  typeRaw?: string,
): { amount: number; direction: "debit" | "credit" } {
  let amount = 0;
  let direction: "debit" | "credit" = "debit"; // Default assume debit for spending

  if (typeof amountRaw === "number") {
    amount = amountRaw;
  } else if (typeof amountRaw === "string") {
    // Check for negative sign
    if (amountRaw.includes("-")) direction = "debit";

    // Check for explicit credit/debit markers
    if (amountRaw.toUpperCase().includes("CR") || amountRaw.includes("+")) {
      direction = "credit";
    }

    // Strip out currency symbols and commas
    const cleaned = amountRaw.replace(/[^0-9.]/g, "");
    amount = parseFloat(cleaned);
  }

  // If a type string was explicitly provided
  if (typeRaw) {
    const t = typeRaw.toUpperCase();
    if (t === "CREDIT" || t === "CR" || t === "INFLOW" || t === "DEPOSIT")
      direction = "credit";
    if (
      t === "DEBIT" ||
      t === "DR" ||
      t === "OUTFLOW" ||
      t === "PAYMENT" ||
      t === "WITHDRAWAL"
    )
      direction = "debit";
  }

  return { amount: Math.abs(amount || 0), direction };
}
