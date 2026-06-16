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

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved) setCollapsed(saved === "true");
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', collapsed ? '60px' : '256px');
  }, [collapsed]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      localStorage.setItem("sidebar-collapsed", String(!prev));
      return !prev;
    });
  };

  const W = collapsed ? "w-[60px]" : "w-64";

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

      <aside
        aria-label="Site navigation"
        className={cn(
          "h-screen fixed top-0 left-0 flex flex-col z-40 transition-all duration-300 ease-in-out",
          "bg-[var(--color-surface)] border-r border-[var(--color-border)]",
          W,
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* ── Brand ──────────────────────────────────────── */}
        <div className={cn(
          "h-16 flex items-center border-b border-[var(--color-border)] flex-shrink-0 overflow-hidden",
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
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[var(--color-accent)] rounded-r-full" />
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
                T
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">Finance Team</p>
                <p className="text-[10px] text-gray-600 truncate">taylos-agent.vercel.app</p>
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
