"use client";

import { motion } from "framer-motion";
import { FloatingCard } from "@/components/ui/FloatingCard";
import { BookOpen, UploadCloud, BrainCircuit, Search, DownloadCloud } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-10 pb-24 overflow-x-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
          <BookOpen className="text-[var(--color-gold)] w-8 h-8" />
          Documentation & Help
        </h1>
        <p className="text-gray-400 text-sm md:text-base">A quick guide on how to use the Taylos Financial Intelligence Platform.</p>
      </motion.div>

      <div className="space-y-6">
        <FloatingCard className="flex gap-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center border border-[var(--color-gold)]/20 shadow-[var(--shadow-glow)]">
            <UploadCloud className="text-[var(--color-gold)] w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">1. Uploading Documents</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Navigate to the <strong>Upload Documents</strong> page using the sidebar. You can drag and drop financial files (such as Bank Statements, CSVs, or JSON data) directly into the dashed upload zone. The system will automatically parse and categorize the extracted data points.
            </p>
          </div>
        </FloatingCard>

        <FloatingCard className="flex gap-6" delay={0.1}>
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center border border-[var(--color-gold)]/20 shadow-[var(--shadow-glow)]">
            <BrainCircuit className="text-[var(--color-gold)] w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">2. AI Processing</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Once uploaded, the Taylos AI agent begins cross-referencing your documents. It checks for discrepancies, duplicates, unusual patterns, or missing receipts. You can see a high-level summary of the findings right on the <strong>Dashboard</strong>.
            </p>
          </div>
        </FloatingCard>

        <FloatingCard className="flex gap-6" delay={0.2}>
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--color-critical)]/10 flex items-center justify-center border border-[var(--color-critical)]/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <Search className="text-[var(--color-critical)] w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">3. Investigating Anomalies</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              On the <strong>Dashboard</strong>, scroll down to the "Intelligent Diagnosis" section. You will see a list of flagged issues color-coded by severity (Red for Critical, Yellow for Warnings). Click on any row to expand the <strong>Investigation Panel</strong>. This panel shows you exactly <em>What Happened</em>, <em>Why It Happened</em>, and the <em>Evidence Chain</em> leading to the conclusion.
            </p>
          </div>
        </FloatingCard>

        <FloatingCard className="flex gap-6" delay={0.3}>
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center border border-[var(--color-success)]/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <DownloadCloud className="text-[var(--color-success)] w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">4. Synthesis & Export</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              After reviewing the anomalies, you can export a comprehensive report containing all findings and recommended actions. Use the <strong>Export Unified Report</strong> button on the Dashboard, or export specific JSON data sets for further analysis. Past analyses can be reviewed in the <strong>Analysis History</strong> tab.
            </p>
          </div>
        </FloatingCard>
      </div>
    </div>
  );
}
