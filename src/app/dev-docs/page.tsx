import type { Metadata } from "next";
import { DevDocsPage } from "@/components/docs/DevDocsPage";

export const metadata: Metadata = {
  title: "Developer Documentation",
  description: "REST API reference, webhook setup, and developer guides for Taylos.",
  robots: { index: false, follow: false },
};

export default function DevDocs() {
  return <DevDocsPage />;
}
