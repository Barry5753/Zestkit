import type { MetadataRoute } from "next";

import { targetPages } from "@/config/target-pages";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const compressionPages: MetadataRoute.Sitemap = targetPages.map((page) => ({
    url: new URL(`/${page.slug}`, siteUrl).toString(),
    changeFrequency: "monthly",
    priority: page.targetLabel === "100KB" ? 1 : 0.8,
  }));

  return [
    ...compressionPages,
    {
      url: new URL("/image-format-converter", siteUrl).toString(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: new URL("/open-source", siteUrl).toString(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
