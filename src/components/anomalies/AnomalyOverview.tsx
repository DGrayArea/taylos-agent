"use client";

import { FloatingCard } from "../ui/FloatingCard";
import { AlertTriangle, ShieldAlert, Info, AlertCircle } from "lucide-react";

export function AnomalyOverview() {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <span className="w-1.5 h-8 bg-[var(--color-critical)] rounded-full mr-3 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
          Issues Detected
        </h2>
        <span className="text-gray-400 text-sm">Based on 2,569 records analyzed</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <FloatingCard className="border-t-4 border-t-[var(--color-critical)] bg-gradient-to-b from-[var(--color-critical)]/10 to-transparent">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium text-gray-400 mb-1">Critical / Fraud</div>
              <div className="text-4xl font-bold text-white">1</div>
            </div>
            <ShieldAlert className="w-8 h-8 text-[var(--color-critical)] opacity-80" />
          </div>
        </FloatingCard>

        <FloatingCard className="border-t-4 border-t-[var(--color-warning)] bg-gradient-to-b from-[var(--color-warning)]/10 to-transparent">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium text-gray-400 mb-1">High Priority</div>
              <div className="text-4xl font-bold text-white">1</div>
            </div>
            <AlertTriangle className="w-8 h-8 text-[var(--color-warning)] opacity-80" />
          </div>
        </FloatingCard>

        <FloatingCard className="border-t-4 border-t-[var(--color-gold)] bg-gradient-to-b from-[var(--color-gold)]/10 to-transparent">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium text-gray-400 mb-1">Medium</div>
              <div className="text-4xl font-bold text-white">1</div>
            </div>
            <AlertCircle className="w-8 h-8 text-[var(--color-gold)] opacity-80" />
          </div>
        </FloatingCard>

        <FloatingCard className="border-t-4 border-t-[var(--color-success)] bg-gradient-to-b from-[var(--color-success)]/10 to-transparent">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium text-gray-400 mb-1">Low / Info</div>
              <div className="text-4xl font-bold text-white">1</div>
            </div>
            <Info className="w-8 h-8 text-[var(--color-success)] opacity-80" />
          </div>
        </FloatingCard>
      </div>
    </div>
  );
}
