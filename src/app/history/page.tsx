"use client";

import { motion } from "framer-motion";
import { FloatingCard } from "@/components/ui/FloatingCard";
import { Badge } from "@/components/ui/Badge";
import { FileText, Download } from "lucide-react";

const mockHistory = [
  { id: "REP-042", date: "2023-10-15", documents: 3, issues: 2, status: "Complete" },
  { id: "REP-041", date: "2023-10-10", documents: 1, issues: 0, status: "Complete" },
  { id: "REP-040", date: "2023-10-05", documents: 5, issues: 4, status: "Complete" },
];

export default function HistoryPage() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 pb-24 overflow-x-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Analysis History</h1>
        <p className="text-gray-400 text-sm md:text-base">Review previously generated intelligence reports and findings.</p>
      </motion.div>

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
              {mockHistory.map((row, i) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={row.id} 
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="p-4 font-medium text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[var(--color-gold)]" />
                    {row.id}
                  </td>
                  <td className="p-4 text-sm text-gray-300">{row.date}</td>
                  <td className="p-4 text-sm text-gray-300">{row.documents}</td>
                  <td className="p-4 text-sm">
                    {row.issues > 0 ? (
                      <span className="text-[var(--color-critical)] font-bold">{row.issues} detected</span>
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
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </FloatingCard>
    </div>
  );
}
