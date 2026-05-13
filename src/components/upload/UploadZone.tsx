"use client";

import { motion } from "framer-motion";
import { UploadCloud, FileText, CheckCircle } from "lucide-react";
import { FloatingCard } from "../ui/FloatingCard";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

export function UploadZone() {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    setIsProcessing(true);

    // Simulate sending a parsed document payload to our new API
    const mockPayload = [
      {
        filename: "Bank_Statement_March.csv",
        content_type: "text/csv",
        raw_text: "",
        structured_data: [
          { date: "2024-03-15", amount: "500.00", type: "debit", merchant: "AMZN Mktp US" },
          { date: "2024-03-16", amount: "2500.00", type: "credit", merchant: "PAYROLL INC" }
        ]
      },
      {
        filename: "Angry_Email.txt",
        content_type: "text/plain",
        raw_text: "I was charged double for my subscription yesterday! This is unacceptable."
      }
    ];

    try {
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockPayload)
      });
      const data = await response.json();
      console.log("Unified Master Model from Agent:", data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to process data", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <FloatingCard className={cn(
      "border-2 border-dashed transition-all duration-500",
      isDragActive ? "border-[var(--color-gold)] bg-[var(--color-gold)]/5 shadow-[var(--shadow-glow)]" : "border-white/20 hover:border-[var(--color-gold)]/50",
      success && "border-[var(--color-success)] bg-[var(--color-success)]/5"
    )}>
      <div 
        className="flex flex-col items-center justify-center py-16 px-4 text-center cursor-pointer"
        onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={handleDrop}
      >
        {isProcessing ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 shadow-[var(--shadow-level-1)] border-t-2 border-[var(--color-gold)]"
          />
        ) : success ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            <CheckCircle className="w-10 h-10 text-[var(--color-success)]" />
          </motion.div>
        ) : (
          <motion.div
            animate={isDragActive ? { y: [0, -10, 0] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 shadow-[var(--shadow-level-1)]"
          >
            <UploadCloud className={cn("w-10 h-10 transition-colors", isDragActive ? "text-[var(--color-gold)]" : "text-gray-400")} />
          </motion.div>
        )}
        
        <h3 className="text-xl font-bold mb-2">
          {isProcessing ? "Processing Data..." : success ? "Analysis Complete!" : "Drag documents here or click to browse"}
        </h3>
        <p className="text-gray-400 text-sm mb-6 max-w-md">
          {isProcessing 
            ? "Extracting entities, normalizing dates, and standardizing merchants..." 
            : success 
              ? "Check the console to see the Unified Master JSON model!" 
              : "Upload bank statements, invoices, customer complaints, or account history to begin AI analysis."}
        </p>

        {!isProcessing && !success && (
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <FileText className="w-3.5 h-3.5" /> PDF
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <FileText className="w-3.5 h-3.5" /> CSV
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <FileText className="w-3.5 h-3.5" /> JSON
            </div>
          </div>
        )}
      </div>
    </FloatingCard>
  );
}
