import type { MetadataRoute } from "next";

import { targetPages } from "@/config/target-pages";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return targetPages.map((page) => ({
    url: new URL(`/${page.slug}`, siteUrl).toString(),
    changeFrequency: "monthly",
    priority: page.targetLabel === "100KB" ? 1 : 0.8,
  }));
}
