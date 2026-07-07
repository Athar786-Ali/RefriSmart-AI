// frontend/src/app/robots.ts
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/service",
          "/products",
          "/ai-diagnosis",
          "/sell",
          "/gallery",
          "/blog",
          "/blog/",
          "/services/",
          "/refrigerator-repair/",
          "/ac-repair/",
          "/washing-machine-repair/",
          "/brands/",
        ],
        disallow: ["/admin", "/admin/", "/orders", "/verify-otp", "/technician"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
