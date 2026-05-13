import { cn } from "@/lib/utils";
import React from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", children, ...props }, ref) => {
    const variants = {
      primary: "bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-light)] text-[var(--color-navy)] font-semibold shadow-[0_4px_14px_rgba(212,175,55,0.25)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.4)] hover:-translate-y-0.5",
      secondary: "bg-[var(--color-card)] text-white border border-white/10 hover:bg-white/5 hover:border-white/20 hover:-translate-y-0.5 shadow-[var(--shadow-level-1)]",
      danger: "bg-[var(--color-critical)]/10 text-[var(--color-critical)] border border-[var(--color-critical)]/20 hover:bg-[var(--color-critical)] hover:text-white hover:-translate-y-0.5 shadow-[0_4px_14px_rgba(239,68,68,0.1)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.3)]",
      ghost: "bg-transparent text-gray-300 hover:text-white hover:bg-white/5",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center px-4 py-2 text-sm rounded-xl transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
