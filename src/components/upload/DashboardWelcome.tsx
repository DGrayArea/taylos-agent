"use client";

import { motion } from "framer-motion";
import { FloatingCard } from "@/components/ui/FloatingCard";
import { UploadCloud, History, Shield } from "lucide-react";
import Link from "next/link";

export function DashboardWelcome() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Welcome hero */}
      <FloatingCard className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br from-[var(--color-gold)]/5 to-transparent border-[var(--color-gold)]/20">
        <div className="w-20 h-20 rounded-2xl bg-[var(--color-gold)]/10 flex items-center justify-center flex-shrink-0">
          <Shield className="w-10 h-10 text-[var(--color-gold)]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2 text-[var(--color-gold-light)]">
            Welcome to Taylos Finance
          </h2>
          <p className="text-gray-300 leading-relaxed max-w-2xl">
            This platform helps your finance team quickly spot errors, duplicate
            payments, and irregularities in your financial documents — without
            needing to check every row manually.
          </p>
        </div>
      </FloatingCard>

      {/* How it works steps */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/upload" className="block group">
          <FloatingCard className="p-6 h-full border-white/10 group-hover:border-[var(--color-gold)]/40 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-gold)]/20 transition-colors">
                <UploadCloud className="w-6 h-6 text-[var(--color-gold)]" />
              </div>
              <div>
                <div className="text-[var(--color-gold-light)] text-xs font-medium uppercase tracking-wider mb-1">
                  Step 1
                </div>
                <h3 className="text-base font-bold mb-2">
                  Upload Your Documents
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Submit your bank statements, invoices, payment schedules, or
                  transaction logs. We accept PDF, Excel, CSV, and JSON formats.
                </p>
                <span className="inline-block mt-4 text-sm text-[var(--color-gold-light)] font-medium group-hover:underline">
                  Go to Upload →
                </span>
              </div>
            </div>
          </FloatingCard>
        </Link>

        <Link href="/history" className="block group">
          <FloatingCard className="p-6 h-full border-white/10 group-hover:border-[var(--color-gold)]/40 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                <History className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <div className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">
                  Step 2
                </div>
                <h3 className="text-base font-bold mb-2">
                  Review Your Findings
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Once your documents have been reviewed, a clear summary of any
                  issues found will appear here on the dashboard and in your
                  Review History.
                </p>
                <span className="inline-block mt-4 text-sm text-gray-500 font-medium">
                  View History →
                </span>
              </div>
            </div>
          </FloatingCard>
        </Link>
      </div>
    </motion.div>
  );
}
