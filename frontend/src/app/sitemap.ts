// frontend/src/app/sitemap.ts
import type { MetadataRoute } from "next";
import {
  SITE_URL,
  TARGET_AREAS,
  BRANDS,
  SERVICES,
  BLOG_POSTS,
} from "@/lib/seo-config";

const now = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  // ─── Core Pages ──────────────────────────────────────────────────────────────
  const corePages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/service`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/ai-diagnosis`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/sell`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/gallery`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
  ];

  // ─── Service Pages ────────────────────────────────────────────────────────────
  const servicePages: MetadataRoute.Sitemap = SERVICES.map((svc) => ({
    url: `${SITE_URL}/services/${svc.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  // ─── Area Pages – Refrigerator Repair ────────────────────────────────────────
  const fridgeAreaPages: MetadataRoute.Sitemap = TARGET_AREAS.map((area) => ({
    url: `${SITE_URL}/refrigerator-repair/${area.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  // ─── Area Pages – AC Repair ───────────────────────────────────────────────────
  const acAreaPages: MetadataRoute.Sitemap = TARGET_AREAS.map((area) => ({
    url: `${SITE_URL}/ac-repair/${area.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  // ─── Area Pages – Washing Machine Repair ─────────────────────────────────────
  const washingAreaPages: MetadataRoute.Sitemap = TARGET_AREAS.map((area) => ({
    url: `${SITE_URL}/washing-machine-repair/${area.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // ─── Brand Pages ──────────────────────────────────────────────────────────────
  const brandPages: MetadataRoute.Sitemap = BRANDS.map((brand) => ({
    url: `${SITE_URL}/brands/${brand.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  // ─── Blog Posts ───────────────────────────────────────────────────────────────
  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.publishDate),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [
    ...corePages,
    ...servicePages,
    ...fridgeAreaPages,
    ...acAreaPages,
    ...washingAreaPages,
    ...brandPages,
    ...blogPages,
  ];
}
