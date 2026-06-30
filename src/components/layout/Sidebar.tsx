"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard, UploadCloud, History, HelpCircle, Shield,
  Activity, BarChart3, FolderOpen, Layers, Lock, Book, Code,
  ChevronLeft, ChevronRight, User, Users, LifeBuoy, Clock
} from "lucide-react";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMobileMenu } from "@/lib/MobileMenuContext";
import { createClient } from "@/lib/supabase/client";
import { logout } from "@/app/auth/actions";
import { Role } from "@/lib/rbac";
import { getCurrentUserRole } from "@/app/auth/actions";

interface NavItem {
  icon: any;
  label: string;
  href: string;
  roles: string[];
  soon?: boolean;
  authenticatedOnly?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

// ─── Nav structure ─────────────────────────────────────────────
const navGroups: NavGroup[] = [
  {
    label: "Navigation",
    items: [
      { icon: LayoutDashboard, label: "Dashboard",      href: "/", roles: ["auditor"] },
      { icon: FolderOpen, label: "Cases",          href: "/cases", roles: ["global_admin", "org_admin", "analyst", "auditor"] },
      { icon: History,    label: "Review History", href: "/history", roles: ["global_admin", "org_admin", "analyst", "auditor"] },
    ],
  },
  {
    label: "Work",
    items: [
      { icon: UploadCloud, label: "Upload Documents", href: "/upload", roles: ["analyst"] },
      { icon: Layers,      label: "Batch Jobs",       href: "/batch", roles: ["analyst"] },
      { icon: BarChart3,   label: "Analytics",        href: "/analytics", roles: ["analyst"] },
    ],
  },
  {
    label: "Integrations",
    items: [
      { icon: Code,       label: "APIs",     href: "/integrations/api", roles: ["org_admin"] },
      { icon: Layers,     label: "Plugins",  href: "/integrations/plugins", roles: ["org_admin"] },
    ],
  },
  {
    label: "Admin",
    items: [
      { icon: Lock,       label: "Audit Log",       href: "/audit", roles: ["org_admin", "auditor"] },
      { icon: Users,      label: "Team & Members",  href: "/team", roles: ["org_admin"] },
      { icon: LifeBuoy,   label: "Support",         href: "/support", roles: ["org_admin"] },
      { icon: Clock,      label: "Deadlines",       href: "/deadlines", roles: ["org_admin"] },
      { icon: Shield,     label: "Manage Global admin", href: "/admin", roles: ["global_admin"] },
    ],
  },
  {
    label: "Account",
    items: [
      { icon: User,       label: "Profile",       href: "/profile", authenticatedOnly: true, roles: ["global_admin", "org_admin", "analyst", "auditor"] },
    ],
  },
  {
    label: "Resources",
    items: [
      { icon: Book,       label: "Documentation", href: "/docs", roles: ["global_admin", "org_admin", "analyst", "auditor"] },
      { icon: HelpCircle, label: "Help",           href: "/help", roles: ["global_admin", "org_admin", "analyst", "auditor"] },
    ],
  },
];

// ─── Component ─────────────────────────────────────────────────
export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useMobileMenu();
  const [collapsed, setCollapsed] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userInitials, setUserInitials] = useState<string>("U");
  const [userRole, setUserRole] = useState<Role | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email ?? null);
        const meta = user.user_metadata || {};
        setUserAvatar(meta.avatar_url ?? null);

        let initials = "";
        if (meta.first_name) {
          initials = meta.first_name[0];
          if (meta.last_name) initials += meta.last_name[0];
        } else if (meta.full_name) {
          const parts = meta.full_name.trim().split(/\s+/);
          initials = parts[0][0];
          if (parts.length > 1) initials += parts[1][0];
        } else if (user.email) {
          initials = user.email[0];
        }
        setUserInitials(initials.toUpperCase() || "U");

        // Fetch resolved user role via server action
        try {
          const { role } = await getCurrentUserRole();
          setUserRole(role);
        } catch (err) {
          console.error("Error checking user role in sidebar:", err);
        }
      }
      setCheckingAuth(false);
    });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved) setCollapsed(saved === "true");
  }, []);

  useEffect(() => {
    const mdMatch = window.matchMedia("(min-width: 768px)");
    const isMd = mdMatch.matches;
    const baseWidth = isOpen || !collapsed ? 16 : 5;
    const totalWidth = isMd ? baseWidth + 1 : baseWidth;

    document.documentElement.style.setProperty(
      "--sidebar-width",
      `${totalWidth}rem`
    );
  }, [isOpen, collapsed]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      localStorage.setItem("sidebar-collapsed", String(!prev));
      return !prev;
    });
  };

  // Filter nav groups dynamically based on role
  const displayedGroups = navGroups.map(group => {
    const items = group.items.filter(item => {
      if (item.authenticatedOnly && !userEmail) return false;
      if (!userRole) {
        // Unauthenticated or onboarding accounts only see basic links
        return item.href === "/" || item.href === "/docs" || item.href === "/help";
      }
      return item.roles.includes(userRole);
    });
    return { ...group, items };
  }).filter(group => group.items.length > 0);

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
          {displayedGroups.map((group) => (
            <div key={group.label}>
              {/* Section label — hidden when collapsed */}
              {!collapsed && (
                <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-600 select-none">
                  {group.label}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  if (item.authenticatedOnly && !userEmail) return null;
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

                {/* Render the user info row directly under the Account section label/items */}
                {group.label === "Account" && !collapsed && (
                  <div className="px-3 py-2.5 mx-1 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3 mt-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                    {checkingAuth ? (
                      <div className="min-w-0 flex-1 py-1">
                        <p className="text-xs text-gray-500 animate-pulse">Checking session...</p>
                      </div>
                    ) : userEmail ? (
                      <>
                        {userAvatar ? (
                          <img
                            src={userAvatar}
                            alt="User avatar"
                            className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-white/10"
                          />
                        ) : (
                          <div
                            aria-hidden="true"
                            className="w-7 h-7 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white font-bold text-[11px] flex-shrink-0"
                          >
                            {userInitials}
                          </div>
                        )}
                        <div className="min-w-0 flex-1 text-left">
                          <p className="text-xs font-semibold text-white truncate leading-tight">{userEmail}</p>
                          <form action={logout} className="mt-0.5">
                            <button type="submit" className="text-[10px] text-[var(--color-gold-light)] hover:text-white truncate transition-colors text-left">
                              Sign out
                            </button>
                          </form>
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          aria-hidden="true"
                          className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-gray-400 font-bold text-[11px] flex-shrink-0"
                        >
                          G
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <p className="text-xs font-semibold text-gray-400 truncate leading-tight">Guest User</p>
                          <Link href="/auth/login" className="text-[10px] text-[var(--color-gold-light)] hover:text-white truncate transition-colors text-left block mt-0.5">
                            Sign in
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Footer ─────────────────────────────────────── */}
        <div className="border-t border-[var(--color-border)] flex-shrink-0 hidden lg:block">
          {/* Collapse toggle — desktop only */}
          <button
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex items-center justify-center w-full py-3 text-gray-600 hover:text-gray-300 hover:bg-white/[0.03] transition-colors"
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
