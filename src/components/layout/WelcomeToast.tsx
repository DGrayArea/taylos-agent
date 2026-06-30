"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function WelcomeToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [roleName, setRoleName] = useState("Auditor");

  useEffect(() => {
    const joined = searchParams.get("joined");
    const role = searchParams.get("role");
    
    if (joined === "true") {
      if (role === "org_admin") {
        setRoleName("Org Admin");
      } else if (role === "analyst") {
        setRoleName("Analyst");
      } else if (role === "auditor") {
        setRoleName("Auditor");
      }
      
      setShow(true);

      // Clean up URL parameters without refreshing the page
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("joined");
      newParams.delete("role");
      const cleanPath = window.location.pathname + (newParams.toString() ? `?${newParams.toString()}` : "");
      router.replace(cleanPath);

      // Auto-hide toast after 5 seconds
      const timer = setTimeout(() => {
        setShow(false);
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#0c0d12]/95 backdrop-blur-xl border border-emerald-500/25 rounded-2xl shadow-[0_12px_40px_rgba(16,185,129,0.15)] p-4 flex gap-3 text-xs"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle className="w-4 h-4 animate-pulse" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-emerald-400">
              <Sparkles className="w-3 h-3" />
              Onboarding Complete
            </div>
            <p className="text-gray-300 leading-relaxed">
              Welcome to <span className="font-bold text-white">Disciples Bank</span> — you&apos;ve joined as <span className="font-bold text-emerald-450">{roleName}</span>.
            </p>
          </div>

          <button
            onClick={() => setShow(false)}
            className="text-gray-500 hover:text-white transition-colors cursor-pointer self-start"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
