import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileMenuProvider } from "@/lib/MobileMenuContext";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Taylos agent | Financial Intelligence Dashboard",
  description:
    "Enterprise-grade financial intelligence dashboard for AI agent analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body className="bg-[var(--color-navy)] text-white min-h-screen font-sans selection:bg-[var(--color-gold)]/30 relative overflow-x-hidden">
        {/* Animated Background Orbs */}
        <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-[var(--color-gold)]/5 blur-[120px] animate-blob pointer-events-none z-0" />
        <div className="fixed top-[20%] right-[-5%] w-[35vw] h-[35vw] rounded-full bg-blue-500/5 blur-[120px] animate-blob animation-delay-2000 pointer-events-none z-0" />
        <div className="fixed bottom-[-10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-[var(--color-critical)]/5 blur-[120px] animate-blob animation-delay-4000 pointer-events-none z-0" />

        <div className="relative z-10">
          <MobileMenuProvider>
            <Sidebar />
            <Header />
            <main className="pl-0 md:pl-64 pt-16 min-h-screen px-4 md:px-8 lg:px-12">
              {children}
            </main>
          </MobileMenuProvider>
        </div>
      </body>
    </html>
  );
}
