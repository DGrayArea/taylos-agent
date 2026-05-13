import { cn } from "@/lib/utils";
import React from "react";

export type BadgeVariant = "critical" | "high" | "medium" | "low" | "outline" | "gold";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "outline", children, ...props }: BadgeProps) {
  const variants = {
    critical: "bg-[var(--color-critical)]/10 text-[var(--color-critical)] border-[var(--color-critical)]/20",
    high: "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20",
    medium: "bg-[var(--color-gold)]/10 text-[var(--color-gold)] border-[var(--color-gold)]/20",
    low: "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20",
    gold: "bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-light)] text-[var(--color-navy)] border-transparent font-semibold shadow-[var(--shadow-glow)]",
    outline: "bg-transparent text-gray-300 border-white/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
