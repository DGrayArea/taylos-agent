"use client";

import { motion } from "framer-motion";
import { File, CheckCircle, Clock } from "lucide-react";
import { FloatingCard } from "../ui/FloatingCard";
import { ProgressBar } from "../ui/ProgressBar";
import { mockDocuments } from "@/lib/mockData";

export function UploadProgress() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
      {mockDocuments.map((doc, i) => (
        <FloatingCard key={doc.id} delay={0.1 * i} className="p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                <File className="w-5 h-5 text-[var(--color-gold-light)]" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium truncate w-32">{doc.name}</span>
                <span className="text-xs text-gray-400">{doc.size}</span>
              </div>
            </div>
            {doc.status === "Complete" ? (
              <CheckCircle className="w-5 h-5 text-[var(--color-success)]" />
            ) : (
              <Clock className="w-5 h-5 text-[var(--color-warning)]" />
            )}
          </div>
          
          <div className="space-y-1.5 mt-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>{doc.status === "Complete" ? "Parsed & Analyzed" : "Extracting Data..."}</span>
              <span>{doc.status === "Complete" ? "100%" : "68%"}</span>
            </div>
            <ProgressBar progress={doc.status === "Complete" ? 100 : 68} colorClass={doc.status === "Complete" ? "bg-[var(--color-success)]" : undefined} />
          </div>
        </FloatingCard>
      ))}
    </div>
  );
}
