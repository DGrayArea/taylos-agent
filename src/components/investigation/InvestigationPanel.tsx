"use client";

import { motion } from "framer-motion";
import { FloatingCard } from "../ui/FloatingCard";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Shield, BrainCircuit, Activity, LineChart, FileText, Target } from "lucide-react";
import type { Anomaly } from "@/lib/mockData";
import React from "react";

interface Props {
  anomaly: Anomaly;
}

export function InvestigationPanel({ anomaly }: Props) {
  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-6 border-t border-white/5 pt-6 grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Column 1: What & Why */}
      <div className="flex flex-col gap-4">
        <FloatingCard hoverEffect={false} className="bg-white/[0.02] border-white/5 p-5">
          <div className="flex items-center gap-2 mb-3 text-[var(--color-gold-light)] font-medium text-sm">
            <Activity className="w-4 h-4" /> WHAT HAPPENED?
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">{anomaly.whatHappened}</p>
        </FloatingCard>

        <FloatingCard hoverEffect={false} className="bg-white/[0.02] border-[var(--color-gold)]/20 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <BrainCircuit className="w-24 h-24 text-[var(--color-gold)]" />
          </div>
          <div className="flex items-center gap-2 mb-3 text-[var(--color-gold)] font-medium text-sm relative z-10">
            <Target className="w-4 h-4" /> ROOT CAUSE DIAGNOSIS
          </div>
          <p className="text-white text-sm leading-relaxed relative z-10">{anomaly.whyHappened}</p>
        </FloatingCard>
        
        <div className="mt-2">
          <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">System Classification</div>
          <Badge variant={anomaly.severity} className="text-sm px-4 py-1">
            {anomaly.classification}
          </Badge>
        </div>
      </div>

      {/* Column 2: Evidence Chain */}
      <div className="flex flex-col gap-4">
        <div className="text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
          <Shield className="w-4 h-4" /> EVIDENCE CHAIN
        </div>
        <div className="relative pl-4 border-l-2 border-white/10 space-y-4">
          {anomaly.evidence.map((ev, i) => (
            <motion.div 
              key={ev.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-[var(--color-gold)] shadow-[var(--shadow-glow)]" />
              <FloatingCard hoverEffect={false} className="p-3 bg-white/[0.02]">
                <div className="text-xs text-gray-400 mb-1">{ev.label}</div>
                <div className="text-sm text-gray-200">{ev.detail}</div>
              </FloatingCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Column 3: Impact & Action */}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <div className="text-xs text-gray-400 mb-1">Financial Impact</div>
            <div className="text-lg font-bold text-[var(--color-critical)]">{anomaly.impact.financial}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
            <svg className="w-16 h-16 absolute -right-2 -bottom-2 text-[var(--color-gold)] opacity-10 group-hover:scale-110 transition-transform" viewBox="0 0 36 36">
              <path className="text-white/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
              <path className="text-[var(--color-success)]" strokeDasharray={`${anomaly.confidence}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
            </svg>
            <div className="text-2xl font-bold text-white relative z-10">{anomaly.confidence}%</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider relative z-10">Confidence</div>
          </div>
          <div className="col-span-2 bg-white/5 rounded-xl p-4 border border-white/5">
            <div className="text-xs text-gray-400 mb-1">Customer / System Impact</div>
            <div className="text-sm text-gray-200">{anomaly.impact.customer}</div>
          </div>
        </div>

        <div className="mt-auto pt-4 flex flex-col gap-3">
          <div className="text-xs text-gray-400 text-center">RECOMMENDED ACTION</div>
          <Button variant="primary" className="w-full py-3 text-base">
            {anomaly.recommendedAction}
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1 text-xs py-2">
              <FileText className="w-3.5 h-3.5 mr-2" /> Export Report
            </Button>
            <Button variant="ghost" className="flex-1 text-xs py-2 border border-white/10">
              <LineChart className="w-3.5 h-3.5 mr-2" /> View Timeline
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
