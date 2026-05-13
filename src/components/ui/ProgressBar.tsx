"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number;
  className?: string;
  colorClass?: string;
}

export function ProgressBar({ progress, className, colorClass = "bg-gradient-to-r from-[var(--color-gold-light)] to-[var(--color-gold)]" }: ProgressBarProps) {
  return (
    <div className={cn("h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative", className)}>
      <motion.div
        className={cn("h-full rounded-full absolute left-0 top-0 shadow-[var(--shadow-glow)]", colorClass)}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
  );
}
