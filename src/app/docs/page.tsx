import { UserDocsPage } from "@/components/docs/UserDocsPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Guide",
  description:
    "Complete user guide for Taylos — how to upload documents, review anomalies, and manage cases.",
  alternates: { canonical: "https://taylos-agent.vercel.app/docs" },
  openGraph: {
    title: "User Guide | Taylos",
    description:
      "Learn how to use Taylos to detect anomalies and manage your financial investigations.",
    url: "https://taylos-agent.vercel.app/docs",
  },
};

export default function Docs() {
  return <UserDocsPage />;
}
