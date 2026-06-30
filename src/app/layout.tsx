import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { WelcomeToast } from "@/components/layout/WelcomeToast";
import { MobileMenuProvider } from "@/lib/MobileMenuContext";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const BASE_URL = "https://taylos-agent.vercel.app";
const BRAND = "Taylos";
const TAGLINE = "AI-Powered Financial Intelligence";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: `${BRAND} — ${TAGLINE}`,
    template: `%s | ${BRAND}`,
  },
  description:
    "Taylos detects anomalies, duplicate payments, and fraud indicators in financial documents using AI. Built for finance teams that need answers fast.",

  keywords: [
    "financial anomaly detection",
    "AI finance audit",
    "fraud detection software",
    "financial document analysis",
    "bank statement review",
    "invoice audit AI",
    "payroll fraud detection",
    "financial intelligence platform",
    "Taylos",
  ],

  authors: [{ name: "Taylos", url: BASE_URL }],
  creator: "Taylos",
  publisher: "Taylos",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_GB",
    url: BASE_URL,
    siteName: BRAND,
    title: `${BRAND} — ${TAGLINE}`,
    description:
      "AI-powered financial document review. Detect anomalies, duplicates, and fraud indicators in seconds — not days.",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Taylos — AI-Powered Financial Intelligence Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `${BRAND} — ${TAGLINE}`,
    description:
      "AI-powered financial document review. Detect anomalies, duplicates, and fraud indicators in seconds.",
    images: [`${BASE_URL}/og-image.png`],
    creator: "@taylosfinance",
  },

  alternates: {
    canonical: BASE_URL,
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },

  category: "finance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-GB"
      className={cn("font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body className="bg-[var(--color-navy)] text-white min-h-screen font-sans selection:bg-[var(--color-gold)]/30 relative overflow-x-hidden">
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Taylos",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Web",
              description:
                "AI-powered financial document review platform. Detects anomalies, duplicate payments, and fraud indicators in bank statements, invoices, and payroll records.",
              url: "https://taylos-agent.vercel.app",
              offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
              creator: {
                "@type": "Organization",
                name: "Taylos",
                url: "https://taylos-agent.vercel.app",
              },
              featureList: [
                "AI anomaly detection",
                "Duplicate payment identification",
                "Fraud pattern recognition",
                "Batch document processing",
                "REST API integration",
                "Embeddable widget",
                "Real-time monitoring",
                "Case management",
                "Audit logging",
                "Role-based access control",
              ],
            }),
          }}
        />

        {/* Skip to main content — accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[var(--color-gold)] focus:text-[var(--color-navy)] focus:font-semibold focus:text-sm"
        >
          Skip to main content
        </a>

        {/* Ambient background — decorative, aria-hidden */}
        <div aria-hidden="true" className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-[var(--color-accent)]/5 blur-[120px] animate-blob pointer-events-none z-0" />
        <div aria-hidden="true" className="fixed top-[20%] right-[-5%] w-[35vw] h-[35vw] rounded-full bg-[var(--color-accent)]/5 blur-[120px] animate-blob animation-delay-2000 pointer-events-none z-0" />
        <div aria-hidden="true" className="fixed bottom-[-10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-[var(--color-gold)]/5 blur-[120px] animate-blob animation-delay-4000 pointer-events-none z-0" />

        <div className="relative z-10">
          <MobileMenuProvider>
            {/* Primary site navigation */}
            <Sidebar />
            {/* Site-wide header / topbar */}
            <Header />
            {/* Welcome notification toast */}
            <WelcomeToast />
            <main className="flex-1 lg:pl-[var(--sidebar-width,256px)] min-h-screen transition-[padding] duration-300">
              <div id="main-content" className="pt-16 max-w-[1600px] mx-auto min-h-[calc(100vh-4rem)] px-4 md:px-6 lg:px-8">
                {children}
              </div>
            </main>
          </MobileMenuProvider>
        </div>
      </body>
    </html>
  );
}
