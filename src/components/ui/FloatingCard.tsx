"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

interface FloatingCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delay?: number;
  hoverEffect?: boolean;
}

export function FloatingCard({ children, className, delay = 0, hoverEffect = true, ...props }: FloatingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={hoverEffect ? { y: -5, transition: { duration: 0.2 } } : {}}
      className={cn(
        "bg-[var(--color-navy)]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6",
        "shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-500",
        hoverEffect && "hover:shadow-[0_8px_30px_rgba(212,175,55,0.15)] hover:border-[var(--color-gold)]/40 hover:bg-[var(--color-navy)]/80",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
