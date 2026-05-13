import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileMenuProvider } from "@/lib/MobileMenuContext";

export const metadata: Metadata = {
  title: "Taylos agent | Financial Intelligence Dashboard",
  description: "Enterprise-grade financial intelligence dashboard for AI agent analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[var(--color-navy)] text-white min-h-screen font-sans selection:bg-[var(--color-gold)]/30">
        <MobileMenuProvider>
          <Sidebar />
          <Header />
          <main className="pl-0 md:pl-64 pt-16 min-h-screen">
            {children}
          </main>
        </MobileMenuProvider>
      </body>
    </html>
  );
}
