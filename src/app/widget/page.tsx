// src/app/widget/page.tsx
// Feature 2: Embeddable Widget — minimal iframe-able upload + results UI
import { WidgetEmbed } from "@/components/widget/WidgetEmbed";

export const metadata = {
  title: "Taylos Agent Widget",
  description: "Embeddable financial analysis widget.",
};

export default function WidgetPage() {
  return <WidgetEmbed />;
}
