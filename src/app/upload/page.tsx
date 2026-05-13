"use client";

import { motion } from "framer-motion";
import { UploadZone } from "@/components/upload/UploadZone";
import { UploadProgress } from "@/components/upload/UploadProgress";
import { DataIntakeSummary } from "@/components/upload/DataIntakeSummary";
import { UploadProvider } from "@/components/upload/UploadContext";

export default function UploadPage() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 md:space-y-16 pb-24 overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Upload Documents</h1>
        <p className="text-gray-400 text-sm md:text-base">
          Drag and drop your financial files for automated extraction and analysis.
        </p>
      </motion.div>

      <UploadProvider>
        <section>
          <UploadZone />
          <UploadProgress />
          <DataIntakeSummary />
        </section>
      </UploadProvider>
    </div>
  );
}
