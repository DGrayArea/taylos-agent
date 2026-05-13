"use client";

import { useState } from "react";
import { FloatingCard } from "../ui/FloatingCard";
import { Badge } from "../ui/Badge";
import { mockAnomalies } from "@/lib/mockData";
import { ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { InvestigationPanel } from "../investigation/InvestigationPanel";
import { AnimatePresence } from "framer-motion";

export function AnomalyList() {
  const [expandedId, setExpandedId] = useState<string | null>(mockAnomalies[0].id);

  return (
    <div className="space-y-4">
      {mockAnomalies.map((anomaly, i) => {
        const isExpanded = expandedId === anomaly.id;

        return (
          <FloatingCard 
            key={anomaly.id} 
            delay={0.3 + i * 0.1}
            className="p-0 overflow-hidden cursor-pointer group"
            onClick={() => setExpandedId(isExpanded ? null : anomaly.id)}
          >
            {/* Header / Summary Row */}
            <div className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-6 w-1/2">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 group-hover:border-[var(--color-gold)]/30 transition-colors">
                  <AlertCircle className="w-5 h-5 text-gray-400 group-hover:text-[var(--color-gold)] transition-colors" />
                </div>
                <div>
                  <div className="text-base font-bold text-white mb-1 group-hover:text-[var(--color-gold-light)] transition-colors">
                    {anomaly.type}
                  </div>
                  <div className="text-xs text-gray-400">{anomaly.description}</div>
                </div>
              </div>

              <div className="flex items-center gap-8 w-1/2 justify-end">
                <div className="text-right hidden md:block">
                  <div className="text-sm font-medium text-white mb-1">
                    {anomaly.amount !== null ? `$${anomaly.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "N/A"}
                  </div>
                  <div className="text-xs text-gray-500">{anomaly.date}</div>
                </div>

                <Badge variant={anomaly.severity} className="w-24 justify-center py-1">
                  {anomaly.severity}
                </Badge>

                <div className="text-center w-16">
                  <div className="text-sm font-bold text-white">{anomaly.score}</div>
                  <div className="text-[10px] text-gray-500 uppercase">Score</div>
                </div>

                <div className="text-gray-500">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
            </div>

            {/* Expandable Details */}
            <AnimatePresence>
              {isExpanded && (
                <div className="px-5 pb-5 cursor-default" onClick={(e) => e.stopPropagation()}>
                  <InvestigationPanel anomaly={anomaly} />
                </div>
              )}
            </AnimatePresence>
          </FloatingCard>
        );
      })}
    </div>
  );
}
