"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard, UploadCloud, History, HelpCircle, Shield,
  Activity, BarChart3, FolderOpen, Layers, Lock, Book, Code,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMobileMenu } from "@/lib/MobileMenuContext";
import { createClient } from "@/lib/supabase/client";
import { logout } from "@/app/auth/actions";

// ─── Nav structure ─────────────────────────────────────────────
const navGroups = [
  {
    label: "Core",
    items: [
      { icon: LayoutDashboard, label: "Dashboard",       href: "/" },
      { icon: UploadCloud,    label: "Upload",           href: "/upload" },
      { icon: Activity,       label: "Live Monitor",     href: "/monitor",   soon: true },
    ],
  },
  {
    label: "Analysis",
    items: [
      { icon: BarChart3,  label: "Analytics",     href: "/analytics" },
      { icon: FolderOpen, label: "Cases",          href: "/cases" },
      { icon: Layers,     label: "Batch Jobs",     href: "/batch" },
      { icon: History,    label: "Review History", href: "/history" },
    ],
  },
  {
    label: "Admin",
    items: [
      { icon: Lock,       label: "Audit Log", href: "/audit" },
      { icon: Code,       label: "API Keys",  href: "/settings" },
    ],
  },
  {
    label: "Resources",
    items: [
      { icon: Book,       label: "Documentation", href: "/docs" },
      { icon: HelpCircle, label: "Help",           href: "/help" },
    ],
  },
];

// ─── Component ─────────────────────────────────────────────────
export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useMobileMenu();
  const [collapsed, setCollapsed] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserEmail(user.email ?? null);
    });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved) setCollapsed(saved === "true");
  }, []);

  useEffect(() => {
    const mdMatch = window.matchMedia("(min-width: 768px)");
    
    // On md and above, we have a 16px (1rem) margin on the left.
    // Expanded sidebar is w-64 (256px), collapsed is w-20 (80px).
    const isMd = mdMatch.matches;
    const baseWidth = isOpen || !collapsed ? 256 : 80;
    const totalWidth = isMd ? baseWidth + 16 : baseWidth;
    
    document.documentElement.style.setProperty(
      "--sidebar-width",
      `${totalWidth}px`
    );
  }, [isOpen, collapsed]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      localStorage.setItem("sidebar-collapsed", String(!prev));
      return !prev;
    });
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Desktop Sidebar (Floating style) */}
      <aside
        aria-label="Site navigation"
        className={cn(
          "fixed flex flex-col z-40 transition-all duration-300 ease-in-out",
          // Mobile style
          "top-0 left-0 h-screen bg-[var(--color-surface)] border-r border-[var(--color-border)]",
          // Desktop floating style
          "md:top-4 md:left-4 md:h-[calc(100vh-32px)] md:rounded-3xl",
          "md:bg-white/5 md:backdrop-blur-xl md:border md:border-white/10 md:shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
          collapsed ? "w-20" : "w-[260px] md:w-64",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* ── Brand ──────────────────────────────────────── */}
        <div className={cn(
          "h-16 md:h-12 flex items-center border-b border-[var(--color-border)] flex-shrink-0 overflow-hidden",
          collapsed ? "justify-center px-0" : "px-4 gap-3",
        )}>
          <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-bold text-sm text-white leading-none">Taylos</p>
              <p className="text-[10px] text-[var(--color-accent-hover)] font-medium tracking-widest uppercase mt-0.5">
                AI Finance
              </p>
            </div>
          )}
        </div>

        {/* ── Navigation ─────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 flex flex-col gap-4" aria-label="Main navigation">
          {navGroups.map((group) => (
            <div key={group.label}>
              {/* Section label — hidden when collapsed */}
              {!collapsed && (
                <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-600 select-none">
                  {group.label}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      title={collapsed ? item.label : undefined}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex items-center rounded-lg transition-all duration-200 group relative",
                        collapsed ? "justify-center h-10 w-10 mx-auto" : "px-3 py-2 gap-3",
                        isActive
                          ? "bg-[var(--color-accent-muted)] text-white"
                          : "text-gray-500 hover:text-gray-200 hover:bg-white/[0.04]",
                      )}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-[var(--color-accent)] to-[var(--color-accent-hover)] rounded-r-full shadow-[var(--shadow-glow)]" />
                      )}

                      <item.icon
                        className={cn(
                          "w-[18px] h-[18px] flex-shrink-0 transition-colors",
                          isActive ? "text-[var(--color-accent)]" : "group-hover:text-gray-300",
                        )}
                        aria-hidden="true"
                      />

                      {!collapsed && (
                        <>
                          <span className="text-sm font-medium flex-1 truncate">{item.label}</span>
                          {item.soon && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[var(--color-gold-muted)] text-[var(--color-gold)] border border-[var(--color-gold)]/20">
                              Soon
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Footer ─────────────────────────────────────── */}
        <div className="border-t border-[var(--color-border)] flex-shrink-0">
          {/* User row */}
          {!collapsed && (
            <div className="px-4 py-3 flex items-center gap-3">
              <div
                aria-hidden="true"
                className="w-7 h-7 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white font-bold text-[11px] flex-shrink-0"
              >
                {userEmail ? userEmail[0].toUpperCase() : "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{userEmail ?? "Loading..."}</p>
                <form action={logout}>
                  <button type="submit" className="text-[10px] text-[var(--color-gold-light)] hover:text-white truncate transition-colors text-left">
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Collapse toggle — desktop only */}
          <button
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "hidden lg:flex items-center justify-center w-full py-3 text-gray-600 hover:text-gray-300 hover:bg-white/[0.03] transition-colors",
              "border-t border-[var(--color-border)]",
            )}
          >
            {collapsed
              ? <ChevronRight className="w-4 h-4" />
              : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
}
