"use client";

import { cn } from "@/lib/utils";
import { LayoutDashboard, UploadCloud, History, Settings, HelpCircle, Shield, Activity } from "lucide-react";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMobileMenu } from "@/lib/MobileMenuContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: UploadCloud, label: "Upload Documents", href: "/upload" },
  { icon: Activity, label: "Financial Monitor", href: "/monitor" },
  { icon: History, label: "Review History", href: "/history" },
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: HelpCircle, label: "Help & Guidance", href: "/help" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useMobileMenu();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "w-64 h-screen fixed top-0 left-0 bg-[var(--color-navy)] border-r border-white/5 flex flex-col z-40 transition-transform duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Shield className="w-6 h-6 text-[var(--color-gold)] mr-3 flex-shrink-0" />
          <span className="font-bold text-lg tracking-wide truncate">
            Taylos Finance
          </span>
        </div>

        <nav className="flex-1 py-8 px-4 flex flex-col gap-2 relative">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center w-full px-4 py-3 rounded-xl transition-all duration-300 group relative",
                  isActive ? "text-white" : "text-gray-400 hover:text-white",
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-white/5 rounded-xl border border-white/10 shadow-[var(--shadow-level-1)]" />
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--color-gold)] rounded-r-full shadow-[var(--shadow-glow)]" />
                )}
                <item.icon
                  className={cn(
                    "w-5 h-5 mr-4 relative z-10 transition-colors",
                    isActive
                      ? "text-[var(--color-gold)]"
                      : "group-hover:text-gray-300",
                  )}
                />
                <span className="relative z-10 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile — neutral placeholder */}
        <div className="p-6 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-light)] flex items-center justify-center text-[var(--color-navy)] font-bold flex-shrink-0">
              FU
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">Finance User</span>
              <span className="text-xs text-gray-400 truncate">
                Taylos Finance Platform
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
