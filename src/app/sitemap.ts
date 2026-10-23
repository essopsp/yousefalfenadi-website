import type { MetadataRoute } from "next";
import { surahs } from "@/lib/data";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  const staticPages: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/surahs", priority: 0.9 },
    { path: "/about", priority: 0.5 },
  ];

  for (const { path, priority } of staticPages) {
    entries.push({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority,
    });
    entries.push({
      url: `${SITE_URL}/en${path === "/" ? "" : path}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: priority * 0.9,
    });
  }

  for (const s of surahs) {
    entries.push({
      url: `${SITE_URL}/surah/${s.number}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
    entries.push({
      url: `${SITE_URL}/en/surah/${s.number}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
