import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/analytics", "/cases", "/batch", "/docs", "/history", "/upload"],
        disallow: [
          "/api/",
          "/audit",
          "/widget",
          "/settings",
          "/cases/",
        ],
      },
    ],
    sitemap: "https://taylos-agent.vercel.app/sitemap.xml",
    host: "https://taylos-agent.vercel.app",
  };
}
