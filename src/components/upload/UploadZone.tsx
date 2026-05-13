"use client";

import { motion } from "framer-motion";
import { UploadCloud, FileText, CheckCircle, X } from "lucide-react";
import { FloatingCard } from "../ui/FloatingCard";
import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useUpload } from "./UploadContext";
import { saveReportToHistory } from "@/app/actions/reports";

const ACCEPTED_MIME = [
  "application/pdf",
  "text/csv",
  "application/json",
  "text/plain",
];

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function UploadZone() {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { files, setFiles, updateFile } = useUpload();

  const isProcessing = files.some(
    (f) => f.status === "uploading" || f.status === "processing",
  );
  const success =
    files.length > 0 && files.every((f) => f.status === "complete");

  const processFiles = async (rawFiles: File[]) => {
    const valid = rawFiles.filter(
      (f) =>
        ACCEPTED_MIME.includes(f.type) ||
        f.name.endsWith(".csv") ||
        f.name.endsWith(".json") ||
        f.name.endsWith(".txt") ||
        f.name.endsWith(".pdf"),
    );
    if (valid.length === 0) return;

    // Register all files immediately so progress cards appear at once
    const entries = valid.map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      name: f.name,
      size: formatBytes(f.size),
      progress: 0,
      status: "uploading" as const,
    }));
    setFiles((prev) => [...prev, ...entries]);

    for (let i = 0; i < valid.length; i++) {
      const file = valid[i];
      const entry = entries[i];

      try {
        updateFile(entry.id, { progress: 30 });

        const formData = new FormData();
        formData.append("files", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        updateFile(entry.id, { progress: 60, status: "processing" });

        if (!uploadRes.ok) throw new Error("Upload failed");
        const { payloads } = await uploadRes.json();

        updateFile(entry.id, { progress: 80 });

        const analyzeRes = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payloads }),
        });

        if (!analyzeRes.ok) throw new Error("Analysis failed");
        const analysis = await analyzeRes.json();
        console.log(`[Taylos Agent] ${file.name}:`, analysis);

        // 4. Save to History (Supabase)
        await saveReportToHistory(analysis);

        updateFile(entry.id, { progress: 100, status: "complete" });
      } catch (err) {
        console.error(`Failed: ${file.name}`, err);
        updateFile(entry.id, { progress: 0, status: "error" });
      }
    }
  };

  // ── Click to browse ──────────────────────────────────────────
  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    processFiles(selected);
    e.target.value = ""; // reset so same file can be picked again
  };

  // ── Drag and drop ────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    processFiles(dropped);
  };

  return (
    <>
      {/* Hidden real file input */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.csv,.json,.txt"
        className="hidden"
        onChange={handleFileInput}
      />

      <FloatingCard
        className={cn(
          "border-2 border-dashed transition-all duration-300 cursor-pointer select-none",
          isDragOver
            ? "border-[var(--color-gold)] bg-[var(--color-gold)]/5 shadow-[var(--shadow-glow)]"
            : "border-white/20 hover:border-[var(--color-gold)]/40",
          success &&
            "border-[var(--color-success)] bg-[var(--color-success)]/5",
        )}
        onClick={handleClick}
      >
        <div
          className="flex flex-col items-center justify-center py-16 px-4 text-center"
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Icon */}
          {isProcessing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border-t-2 border-[var(--color-gold)]"
            />
          ) : success ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center mb-6"
            >
              <CheckCircle className="w-10 h-10 text-[var(--color-success)]" />
            </motion.div>
          ) : (
            <motion.div
              animate={isDragOver ? { y: [0, -10, 0] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6"
            >
              <UploadCloud
                className={cn(
                  "w-10 h-10 transition-colors",
                  isDragOver ? "text-[var(--color-gold)]" : "text-gray-400",
                )}
              />
            </motion.div>
          )}

          {/* Text */}
          <h3 className="text-xl font-bold mb-2">
            {isProcessing
              ? "Processing files..."
              : success
                ? "Analysis complete!"
                : isDragOver
                  ? "Drop your files here"
                  : "Drag files here or click to browse"}
          </h3>
          <p className="text-gray-400 text-sm mb-6 max-w-md">
            {isProcessing
              ? "Uploading, extracting, and running anomaly detection..."
              : success
                ? `${files.length} file${files.length > 1 ? "s" : ""} analysed — check console for the full report.`
                : "Bank statements, invoices, complaints, or transaction logs. PDF, CSV, JSON accepted."}
          </p>

          {/* Format badges */}
          {!isProcessing && !success && (
            <div className="flex gap-3 pointer-events-none">
              {["PDF", "CSV", "JSON", "TXT"].map((fmt) => (
                <div
                  key={fmt}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {fmt}
                </div>
              ))}
            </div>
          )}

          {/* Error reset */}
          {files.some((f) => f.status === "error") && (
            <button
              className="mt-4 text-xs text-red-400 hover:text-red-300 underline flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                setFiles((prev) => prev.filter((f) => f.status !== "error"));
              }}
            >
              <X className="w-3 h-3" /> Clear errors
            </button>
          )}
        </div>
      </FloatingCard>
    </>
  );
}
