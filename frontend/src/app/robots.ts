// frontend/src/app/robots.ts
import type { MetadataRoute } from "next";

const SITE_URL = "https://refrismart-ai.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/service", "/products", "/ai-diagnosis", "/sell", "/gallery"],
        disallow: ["/admin", "/admin/", "/orders", "/verify-otp"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
