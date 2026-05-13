"use client";

import { motion } from "framer-motion";
import { UploadZone } from "@/components/upload/UploadZone";
import { UploadProgress } from "@/components/upload/UploadProgress";
import { DataIntakeSummary } from "@/components/upload/DataIntakeSummary";
import { AnomalyOverview } from "@/components/anomalies/AnomalyOverview";
import { AnomalyList } from "@/components/anomalies/AnomalyList";
import { FloatingCard } from "@/components/ui/FloatingCard";
import { Button } from "@/components/ui/Button";
import { DownloadCloud, Mail, FileJson } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 md:space-y-16 pb-24 overflow-x-hidden">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Financial Intelligence</h1>
          <p className="text-gray-400 text-sm md:text-base">Automated multi-source extraction & anomaly detection</p>
        </div>
        <Button variant="primary" className="shadow-[var(--shadow-glow)] w-full md:w-auto">
          <DownloadCloud className="w-4 h-4 mr-2" /> Export Unified Report
        </Button>
      </motion.div>

      {/* Feature 2 & 3: Anomalies & Investigation */}
      <section className="relative">
        {/* Background glow effect for critical section */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[var(--color-critical)]/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="flex items-center mb-8 relative z-10">
          <h2 className="text-2xl font-bold">Intelligent Diagnosis</h2>
        </div>

        <AnomalyOverview />
        <AnomalyList />
      </section>

      {/* Feature 4: Results & Recommendations */}
      <section>
        <div className="flex items-center mb-6">
          <h2 className="text-2xl font-bold">Synthesis & Export</h2>
        </div>

        <FloatingCard className="bg-gradient-to-br from-white/[0.03] to-transparent border-white/10 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <h3 className="text-xl font-bold mb-3 text-[var(--color-gold-light)]">Analysis Complete</h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Processed 3 documents containing 2,569 records. Identified <span className="text-[var(--color-critical)] font-bold">1 critical fraud</span> incident and <span className="text-[var(--color-warning)] font-bold">1 high priority</span> anomaly. All findings have been cross-verified with 95%+ confidence.
            </p>
            <div className="flex gap-4">
              <Button variant="primary">Download PDF Report</Button>
              <Button variant="secondary">
                <FileJson className="w-4 h-4 mr-2" /> Export JSON
              </Button>
              <Button variant="secondary">
                <Mail className="w-4 h-4 mr-2" /> Email Summary
              </Button>
            </div>
          </div>
          
          {/* Decorative graphic */}
          <div className="relative w-48 h-48 flex-shrink-0 hidden md:block">
            <div className="absolute inset-0 border-[4px] border-[var(--color-gold)]/20 rounded-full animate-[spin_10s_linear_infinite]" />
            <div className="absolute inset-4 border-[2px] border-[var(--color-gold-light)]/40 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-[var(--color-gold)]/10 rounded-full blur-xl animate-pulse" />
              <DownloadCloud className="w-12 h-12 text-[var(--color-gold)] absolute" />
            </div>
          </div>
        </FloatingCard>
      </section>
    </div>
  );
}
