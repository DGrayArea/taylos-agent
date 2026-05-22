"use client";

import { motion } from "framer-motion";
import { UploadZone } from "@/components/upload/UploadZone";
import { UploadProgress } from "@/components/upload/UploadProgress";
import { DataIntakeSummary } from "@/components/upload/DataIntakeSummary";
import { AnalysisReport } from "@/components/upload/AnalysisReport";
import { UploadProvider } from "@/components/upload/UploadContext";
import { FileText, Shield, Zap } from "lucide-react";

export default function UploadPage() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 md:space-y-16 pb-24 overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Submit Documents for Review</h1>
          <p className="text-gray-400 text-sm md:text-base max-w-xl">
            Upload your financial documents and our AI will check them for errors,
            duplicate payments, irregular patterns, and policy violations — then give you
            a clear, plain-English report.
          </p>
        </div>
        <div className="flex gap-4 text-xs text-gray-500">
          {[
            { icon: Shield, label: "Secure upload" },
            { icon: Zap, label: "AI-powered" },
            { icon: FileText, label: "PDF report" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-[var(--color-gold)]" />
              </div>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <UploadProvider>
        <section>
          <UploadZone />
          <UploadProgress />
          <DataIntakeSummary />
          <AnalysisReport />
        </section>
      </UploadProvider>
    </div>
  );
}
