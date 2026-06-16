// src/app/cases/page.tsx
// Feature 10: Case Management — list view
import { createClient } from "@/lib/supabase/server";
import { CasesList } from "@/components/cases/CasesList";

export const metadata = {
  title: "Cases | Taylos Finance",
  description: "Track, assign, and resolve detected anomaly cases.",
};

export default async function CasesPage() {
  const supabase = await createClient();

  const { data: cases } = await supabase
    .from("cases")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const { data: reports } = await supabase
    .from("reports")
    .select("id, created_at, data")
    .order("created_at", { ascending: false })
    .limit(10);

  return <CasesList initialCases={cases ?? []} reports={reports ?? []} />;
}
