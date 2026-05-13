"use server";

// src/app/actions/investigations.ts
// PURPOSE: Server Actions for investigation state management.
// These are called directly from UI components (no fetch needed).
//
// WHAT YOU NEED TO DO:
// 1. Set up a database (Supabase, Prisma+Postgres, etc.)
// 2. Replace the TODO stubs below with your DB calls

import { createClient } from "@/lib/supabase/server";

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
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("investigations")
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error("[saveInvestigation] Error:", error);
    throw new Error(error.message);
  }

  return { success: true, data: result };
}

// ─────────────────────────────────────────────────────────────
// Update investigation status
// ─────────────────────────────────────────────────────────────
export async function updateInvestigationStatus(
  id: string,
  status: "open" | "in_review" | "resolved" | "dismissed",
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("investigations")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("[updateInvestigationStatus] Error:", error);
    throw new Error(error.message);
  }

  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// Fetch all investigations
// ─────────────────────────────────────────────────────────────
export async function getInvestigations() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("investigations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getInvestigations] Error:", error);
    return [];
  }

  return data ?? [];
}
