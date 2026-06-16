import type { Metadata } from "next";
import { WidgetEmbed } from "@/components/widget/WidgetEmbed";

export const metadata: Metadata = {
  title: "Embed Widget",
  description:
    "Embed the Taylos financial analysis widget into any website. Drop in a single script tag to give your users instant AI-powered anomaly detection.",
  robots: { index: false, follow: false },
};

export default function WidgetPage() {
  return <WidgetEmbed />;
}
