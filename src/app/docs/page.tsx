// src/app/docs/page.tsx
// Docs page — comprehensive guide to the Taylos Agent platform
import { DocsPage } from "@/components/docs/DocsPage";

export const metadata = {
  title: "Documentation | Taylos Finance",
  description: "Complete guide to the Taylos Agent platform — API reference, widget embed, webhooks, roles, and features.",
};

export default function Docs() {
  return <DocsPage />;
}
