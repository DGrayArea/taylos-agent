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
        "bg-[var(--color-card)] border border-white/5 rounded-2xl p-6",
        "shadow-[var(--shadow-level-1)] transition-shadow duration-300",
        hoverEffect && "hover:shadow-[var(--shadow-level-2)] hover:border-white/10",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
