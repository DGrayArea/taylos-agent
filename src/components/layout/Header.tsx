"use client";

import { Bell, Search, Menu } from "lucide-react";
import { useMobileMenu } from "@/lib/MobileMenuContext";

export function Header() {
  const { toggle } = useMobileMenu();

  return (
    <header className="h-16 fixed top-0 left-0 md:left-64 right-0 z-30 bg-[var(--color-navy)]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 md:px-8 transition-all duration-300">
      <div className="flex items-center gap-3 md:gap-4 flex-1 md:flex-none md:w-96 min-w-0 mr-4">
        <button onClick={toggle} className="md:hidden p-2 -ml-2 flex-shrink-0 text-gray-400 hover:text-white">
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative w-full min-w-0">
          <Search className="w-4 h-4 md:w-5 md:h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search..." 
          className="w-full bg-[var(--color-card)] border border-white/10 rounded-full py-2 pl-9 md:pl-10 pr-4 text-xs md:text-sm focus:outline-none focus:border-[var(--color-gold)]/50 focus:shadow-[var(--shadow-glow)] transition-all duration-300 text-white placeholder-gray-500"
        />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-critical)] rounded-full shadow-[0_0_8px_var(--color-critical)]" />
        </button>
      </div>
    </header>
  );
}
