"use client";

import { Bell, Search, Menu } from "lucide-react";
import { useMobileMenu } from "@/lib/MobileMenuContext";

export function Header() {
  const { toggle } = useMobileMenu();

  return (
    <header className="h-16 fixed top-0 left-0 lg:left-[var(--sidebar-width,256px)] right-0 z-30 bg-transparent backdrop-blur-xl border-b border-[var(--color-border)] flex items-center justify-between px-4 md:px-6 transition-all duration-300">
      <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
        <button onClick={toggle} className="lg:hidden p-2 -ml-2 flex-shrink-0 text-gray-400 hover:text-white">
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative w-full max-w-md min-w-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search cases, jobs, or docs..." 
            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-full py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:border-[var(--color-accent-border)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all duration-300 text-white placeholder-gray-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors bg-[var(--color-surface-2)] rounded-full border border-[var(--color-border)] hover:border-white/20">
          <Bell className="w-4 h-4" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-[var(--color-accent)] rounded-full border border-[var(--color-surface-2)]" />
        </button>
      </div>
    </header>
  );
}
