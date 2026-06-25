"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, Sparkles, UploadCloud, AlertTriangle, 
  CheckCircle, FileText, RefreshCw, ArrowRight, 
  ShieldAlert, Database, HelpCircle
} from "lucide-react";
import Link from "next/link";
import { FloatingCard } from "@/components/ui/FloatingCard";

// Mock organizations and file names for the simulator
const MOCK_ORGS = ["Apex Corp", "Zenith Labs", "Nova Retail", "Stellar Tech", "Halycon Ltd", "Vortex Digital"];
const MOCK_FILES = [
  { prefix: "invoice_", ext: ".pdf", type: "Invoice" },
  { prefix: "bank_statement_q2_", ext: ".xlsx", type: "Bank Statement" },
  { prefix: "payroll_ledger_may_", ext: ".csv", type: "Payroll" },
  { prefix: "vendor_payouts_", ext: ".json", type: "Payout Log" },
];

interface LiveActivity {
  id: string;
  fileName: string;
  org: string;
  type: string;
  status: "processing" | "success" | "flagged";
  detail?: string;
  timestamp: Date;
}

export function PublicOverview() {
  // Stats counters
  const [statements, setStatements] = useState(14820);
  const [anomalies, setAnomalies] = useState(294);
  const [confidence, setConfidence] = useState(98.62);

  // Live activity stream
  const [activities, setActivities] = useState<LiveActivity[]>([]);
  const [currentProcessing, setCurrentProcessing] = useState<LiveActivity | null>(null);

  // Initialize activities after mount to avoid server-client Date mismatch errors
  useEffect(() => {
    setActivities([
      {
        id: "1",
        fileName: "bank_statement_q1_Apex.xlsx",
        org: "Apex Corp",
        type: "Bank Statement",
        status: "success",
        detail: "1,240 transactions verified. No anomalies.",
        timestamp: new Date(Date.now() - 15000),
      },
      {
        id: "2",
        fileName: "vendor_payouts_Zenith.json",
        org: "Zenith Labs",
        type: "Payout Log",
        status: "flagged",
        detail: "Duplicate payment of £4,250 to 'Acme Services' flagged.",
        timestamp: new Date(Date.now() - 8000),
      },
    ]);
  }, []);

  // Stats increment simulation
  useEffect(() => {
    const statsInterval = setInterval(() => {
      // Small random fluctuations in confidence
      setConfidence((prev) => {
        const change = (Math.random() - 0.5) * 0.04;
        return parseFloat(Math.min(99.1, Math.max(97.8, prev + change)).toFixed(2));
      });
    }, 3000);

    return () => clearInterval(statsInterval);
  }, []);

  // Live activity processing simulation
  useEffect(() => {
    const processNewDoc = () => {
      const org = MOCK_ORGS[Math.floor(Math.random() * MOCK_ORGS.length)];
      const fileTemplate = MOCK_FILES[Math.floor(Math.random() * MOCK_FILES.length)];
      const fileId = Math.floor(Math.random() * 900) + 100;
      const fileName = `${fileTemplate.prefix}${fileId}${fileTemplate.ext}`;
      
      const newActivity: LiveActivity = {
        id: String(Date.now()),
        fileName,
        org,
        type: fileTemplate.type,
        status: "processing",
        timestamp: new Date(),
      };

      setCurrentProcessing(newActivity);

      // Finish processing after 2.5 seconds
      setTimeout(() => {
        const isFlagged = Math.random() < 0.25; // 25% chance of anomaly
        const finalActivity: LiveActivity = {
          ...newActivity,
          status: isFlagged ? "flagged" : "success",
          detail: isFlagged 
            ? `Flagged: Irregular transaction of £${(Math.random() * 8000 + 500).toFixed(0)} detected.`
            : `Success: Checked ${Math.floor(Math.random() * 500 + 40)} rows. All clean.`,
        };

        setCurrentProcessing(null);
        setActivities((prev) => [finalActivity, ...prev.slice(0, 4)]);
        
        // Update stats counters
        setStatements((prev) => prev + 1);
        if (isFlagged) {
          setAnomalies((prev) => prev + 1);
        }
      }, 2500);
    };

    // Run first simulation in 2 seconds, then repeat every 6 seconds
    const initialTimeout = setTimeout(processNewDoc, 2000);
    const loopInterval = setInterval(processNewDoc, 7000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(loopInterval);
    };
  }, []);

  return (
    <div className="space-y-12 pb-20">
      {/* ── HERO BANNER & CTA ──────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-indigo-500/10 via-[var(--color-navy)]/80 to-[var(--color-gold)]/5 p-8 md:p-14 shadow-2xl">
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[var(--color-accent)]/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[var(--color-gold)]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-6 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[var(--color-gold-light)] font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Autonomous Financial Intelligence Agent
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
              Stop auditing financial documents <span className="bg-gradient-to-r from-[var(--color-gold-light)] to-[var(--color-gold)] bg-clip-text text-transparent">manually</span>.
            </h1>

            <p className="text-gray-300 text-base md:text-lg leading-relaxed">
              Taylos automatically reviews bank statements, payroll documents, invoices, and payouts. Detect duplicates, fraud indicators, and compliance anomalies instantly using our advanced AI-driven scanner.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link 
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-light)] text-[var(--color-navy)] font-bold shadow-[0_4px_20px_rgba(245,158,11,0.3)] hover:shadow-[0_6px_24px_rgba(245,158,11,0.5)] hover:-translate-y-0.5 transition-all duration-300 group"
              >
                Sign Up Now
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                href="/auth/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-white font-medium hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Interactive Agent Badge */}
          <div className="w-full md:w-auto flex-shrink-0 flex justify-center">
            <div className="relative w-56 h-56 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center p-6 text-center shadow-[var(--shadow-glow)] group hover:border-[var(--color-accent)]/50 transition-all duration-500">
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-success)] animate-pulse" />
                <span className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase">Live Feed</span>
              </div>
              
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center mb-4 relative">
                <Shield className="w-8 h-8 text-[var(--color-accent)] animate-pulse" />
                <div className="absolute inset-0 rounded-2xl bg-[var(--color-accent)]/5 animate-ping" />
              </div>
              <div className="text-white font-bold text-lg mb-1">Taylos Guard</div>
              <div className="text-gray-400 text-xs leading-relaxed">
                Processing system transactions in real-time.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── REAL-TIME STATISTICS ROW ───────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* STAT 1: Statements Uploaded */}
        <FloatingCard className="border-t-4 border-t-[var(--color-accent)] bg-gradient-to-b from-[var(--color-accent)]/5 to-transparent relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <UploadCloud className="w-16 h-16 text-[var(--color-accent)]" />
          </div>
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
                Statements Analysed
              </div>
              <div className="text-4xl font-extrabold text-white flex items-baseline gap-1.5 tracking-tight">
                <motion.span
                  key={statements}
                  initial={{ opacity: 0.5, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-mono text-white"
                >
                  {statements.toLocaleString()}
                </motion.span>
                <span className="text-xs text-[var(--color-success)] font-bold animate-pulse">+Live</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center border border-[var(--color-accent)]/20">
              <UploadCloud className="w-5 h-5 text-[var(--color-accent)]" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4 leading-relaxed">
            Total files analysed globally by the Taylos AI core across all sandbox integrations.
          </p>
        </FloatingCard>

        {/* STAT 2: Anomalies Detected */}
        <FloatingCard className="border-t-4 border-t-[var(--color-critical)] bg-gradient-to-b from-[var(--color-critical)]/5 to-transparent relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldAlert className="w-16 h-16 text-[var(--color-critical)]" />
          </div>
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
                Anomalies Blocked
              </div>
              <div className="text-4xl font-extrabold text-white flex items-baseline gap-1.5 tracking-tight">
                <motion.span
                  key={anomalies}
                  initial={{ opacity: 0.5, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-mono text-[var(--color-critical)]"
                >
                  {anomalies}
                </motion.span>
                <span className="text-[10px] text-gray-400 font-semibold">flagged cases</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[var(--color-critical)]/10 flex items-center justify-center border border-[var(--color-critical)]/20">
              <AlertTriangle className="w-5 h-5 text-[var(--color-critical)] animate-bounce" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4 leading-relaxed">
            Duplicate billing, out-of-sequence vouchers, and high-risk payout mismatches detected.
          </p>
        </FloatingCard>

        {/* STAT 3: Confidence Level */}
        <FloatingCard className="border-t-4 border-t-[var(--color-success)] bg-gradient-to-b from-[var(--color-success)]/5 to-transparent relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle className="w-16 h-16 text-[var(--color-success)]" />
          </div>
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
                Accuracy Index
              </div>
              <div className="text-4xl font-extrabold text-white flex items-baseline tracking-tight">
                <span className="font-mono text-[var(--color-success)]">{confidence}%</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[var(--color-success)]/10 flex items-center justify-center border border-[var(--color-success)]/20">
              <CheckCircle className="w-5 h-5 text-[var(--color-success)]" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4 leading-relaxed">
            Overall AI evaluation score verified by auditor adjustments and resolution rates.
          </p>
        </FloatingCard>
      </div>

      {/* ── LIVE SIMULATION TERMINAL & WORKFLOW ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT PANEL: Live Activity Stream Terminal */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[var(--color-accent)] rounded-full" />
              Live Security Audits
            </h2>
            <p className="text-gray-400 text-sm">
              Watch Taylos scan incoming financial files and isolate transaction-level details in real time.
            </p>
          </div>

          <div className="flex-1 rounded-2xl bg-white/[0.02] border border-white/10 p-5 md:p-6 shadow-inner font-mono text-sm overflow-hidden flex flex-col justify-between min-h-[400px] relative">
            {/* Terminal Top Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-xs text-gray-500 ml-2">taylos-auditor-daemon v2.4</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Database className="w-3.5 h-3.5 animate-pulse text-[var(--color-accent)]" />
                <span>CONNECTED</span>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              {/* Processing Item (Animated overlay) */}
              {currentProcessing && (
                <div className="p-3.5 rounded-xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 flex items-start justify-between gap-3 animate-pulse">
                  <div className="flex items-start gap-3 min-w-0">
                    <RefreshCw className="w-4.5 h-4.5 text-[var(--color-accent)] animate-spin mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-white text-xs font-bold truncate">
                        {currentProcessing.fileName}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        Org: {currentProcessing.org} | Type: {currentProcessing.type}
                      </div>
                      <div className="text-[11px] text-[var(--color-accent-hover)] mt-1 font-semibold">
                        &gt; running heuristics & parsing vector tables...
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-accent-muted)] border border-[var(--color-accent)]/30 text-white font-bold tracking-wider uppercase">
                    SCANNING
                  </span>
                </div>
              )}

              {/* History stream */}
              <AnimatePresence initial={false}>
                {activities.map((act) => (
                  <motion.div
                    key={act.id}
                    initial={{ opacity: 0, x: -15, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: "auto" }}
                    exit={{ opacity: 0, x: 15 }}
                    transition={{ duration: 0.3 }}
                    className={`p-3.5 rounded-xl border transition-all ${
                      act.status === "flagged"
                        ? "border-[var(--color-critical)]/20 bg-[var(--color-critical)]/5"
                        : "border-white/5 bg-white/[0.01] hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <FileText className={`w-4.5 h-4.5 mt-0.5 flex-shrink-0 ${
                          act.status === "flagged" ? "text-[var(--color-critical)]" : "text-gray-400"
                        }`} />
                        <div className="min-w-0">
                          <div className="text-xs text-white font-semibold truncate flex items-center gap-2">
                            {act.fileName}
                            <span className="text-[10px] text-gray-500 font-normal">
                              ({act.timestamp.toLocaleTimeString()})
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-500">
                            Organisation: {act.org} | Type: {act.type}
                          </div>
                          {act.detail && (
                            <div className={`text-xs mt-1 leading-relaxed ${
                              act.status === "flagged" ? "text-[var(--color-critical)] font-bold" : "text-gray-400"
                            }`}>
                              &gt; {act.detail}
                            </div>
                          )}
                        </div>
                      </div>

                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold tracking-wider uppercase flex-shrink-0 ${
                        act.status === "flagged"
                          ? "bg-[var(--color-critical)]/25 border border-[var(--color-critical)]/40 text-red-400"
                          : "bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 text-emerald-400"
                      }`}>
                        {act.status === "flagged" ? "FLAGGED" : "VERIFIED"}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {/* Terminal Footer */}
            <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-600">
              <span>Ready for uploads (sandbox mode enabled)</span>
              <span>Audit count: {statements}</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Features Walkthrough */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[var(--color-gold)] rounded-full" />
              Audit Features
            </h2>
            <p className="text-gray-400 text-sm">
              Discover what Taylos looks for when evaluating your reports.
            </p>
          </div>

          <div className="flex-1 space-y-4 flex flex-col justify-center">
            {/* Feature 1 */}
            <div className="flex gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-gold)]/10 flex items-center justify-center text-[var(--color-gold-light)] flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm mb-1">Double-Billing & Duplicates</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Identifies identical payment values across vendors and employee records within overlapping billing cycles.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent-hover)] flex-shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm mb-1">Anomaly & Fraud Indicators</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Flags unusual payout times, irregular payout accounts, out-of-character transaction sizes, and missing receipts.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-success)]/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm mb-1">Confidence Scoring & Explanations</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Provides a percentage confidence index for every flagged anomaly, backed by transparent reasons and source matches.
                </p>
              </div>
            </div>
          </div>
          
          {/* Bottom CTA card */}
          <div className="mt-6 p-5 rounded-2xl border border-[var(--color-gold)]/10 bg-gradient-to-r from-[var(--color-gold)]/5 to-transparent flex items-center justify-between gap-4">
            <div className="text-xs text-gray-300 leading-relaxed max-w-[60%]">
              Ready to analyze your own documents? Set up a free account and start reviewing.
            </div>
            <Link 
              href="/auth/signup"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-[var(--color-navy)] bg-[var(--color-gold-light)] rounded-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              Sign Up Free
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
