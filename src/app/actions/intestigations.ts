"use server";

// src/app/actions/investigations.ts
// PURPOSE: Server Actions for investigation state management.
// These are called directly from UI components (no fetch needed).
//
// WHAT YOU NEED TO DO:
// 1. Set up a database (Supabase, Prisma+Postgres, etc.)
// 2. Replace the TODO stubs below with your DB calls

// ─────────────────────────────────────────────────────────────
// Save an investigation result to the database
// ─────────────────────────────────────────────────────────────
export async function saveInvestigation(data: {
  anomaly_id: string;
  classification: string;
  confidence: number;
  summary: string;
  recommendations: string[];
}) {
  // TODO: Save to your database
  // Example with Supabase:
  // const { error } = await supabase.from("investigations").insert(data);
  // if (error) throw new Error(error.message);

  console.log("[saveInvestigation] TODO: Connect database. Data received:", data);
  return { success: true, id: `inv_${Date.now()}` };
}

// ─────────────────────────────────────────────────────────────
// Update investigation status (e.g. mark as resolved)
// ─────────────────────────────────────────────────────────────
export async function updateInvestigationStatus(
  id: string,
  status: "open" | "in_review" | "resolved" | "dismissed"
) {
  // TODO: Update in your database
  // const { error } = await supabase.from("investigations").update({ status }).eq("id", id);

  console.log(`[updateInvestigationStatus] TODO: Update ${id} → ${status}`);
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// Fetch all investigations for the current user/session
// ─────────────────────────────────────────────────────────────
export async function getInvestigations() {
  // TODO: Fetch from your database
  // const { data, error } = await supabase.from("investigations").select("*");
  // return data ?? [];

  console.log("[getInvestigations] TODO: Connect database.");
  return [];
}
