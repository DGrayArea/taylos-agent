import { motion } from "framer-motion";
import { FloatingCard } from "@/components/ui/FloatingCard";
import { Badge } from "@/components/ui/Badge";
import { FileText, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: history, error } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 pb-24 overflow-x-hidden">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Analysis History</h1>
        <p className="text-gray-400 text-sm md:text-base">
          Review previously generated intelligence reports and findings.
        </p>
      </div>

      <FloatingCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase text-gray-500 tracking-wider">
                <th className="p-4 font-medium">Report ID</th>
                <th className="p-4 font-medium">Date Processed</th>
                <th className="p-4 font-medium">Documents</th>
                <th className="p-4 font-medium">Issues Found</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {history?.map((row, i) => (
                <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-medium text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[var(--color-gold)]" />
                    {row.id.substring(0, 8)}...
                  </td>
                  <td className="p-4 text-sm text-gray-300">{row.date}</td>
                  <td className="p-4 text-sm text-gray-300">{row.documents}</td>
                  <td className="p-4 text-sm">
                    {row.issues > 0 ? (
                      <span className="text-[var(--color-critical)] font-bold">
                        {row.issues} detected
                      </span>
                    ) : (
                      <span className="text-[var(--color-success)]">All clear</span>
                    )}
                  </td>
                  <td className="p-4">
                    <Badge variant="outline">{row.status}</Badge>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-[var(--color-gold-light)] hover:text-white transition-colors p-2">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {(!history || history.length === 0) && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">
                    No analysis history found. Upload documents to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </FloatingCard>
    </div>
  );
}
