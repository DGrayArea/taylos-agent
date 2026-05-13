"use client";

import { motion, AnimatePresence } from "framer-motion";
import { File, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { FloatingCard } from "../ui/FloatingCard";
import { ProgressBar } from "../ui/ProgressBar";
import { useUpload } from "./UploadContext";

export function UploadProgress() {
  const { files } = useUpload();

  if (files.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
      <AnimatePresence>
        {files.map((doc, i) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: i * 0.08 }}
          >
            <FloatingCard className="p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
                    <File className="w-5 h-5 text-[var(--color-gold-light)]" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate w-32" title={doc.name}>
                      {doc.name}
                    </span>
                    <span className="text-xs text-gray-400">{doc.size}</span>
                  </div>
                </div>

                {/* Status icon */}
                {doc.status === "complete" && (
                  <CheckCircle className="w-5 h-5 text-[var(--color-success)] flex-shrink-0" />
                )}
                {(doc.status === "uploading" || doc.status === "processing") && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                  >
                    <Clock className="w-5 h-5 text-[var(--color-warning)] flex-shrink-0" />
                  </motion.div>
                )}
                {doc.status === "error" && (
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5 mt-1">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>
                    {doc.status === "complete"
                      ? "Parsed & Analysed"
                      : doc.status === "error"
                        ? "Failed"
                        : doc.status === "processing"
                          ? "Running analysis..."
                          : "Uploading..."}
                  </span>
                  <span>{doc.progress}%</span>
                </div>
                <ProgressBar
                  progress={doc.progress}
                  colorClass={
                    doc.status === "complete"
                      ? "bg-[var(--color-success)]"
                      : doc.status === "error"
                        ? "bg-red-500"
                        : undefined
                  }
                />
              </div>
            </FloatingCard>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
