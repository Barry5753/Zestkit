import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ToolPage } from "@/components/tool-page";
import { getTargetPage, targetPages } from "@/config/target-pages";
import { siteName } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return targetPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getTargetPage(slug);
  if (!page) return {};

  const canonicalPath = `/${page.slug}`;
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: canonicalPath },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      siteName,
      url: canonicalPath,
      title: page.metaTitle,
      description: page.metaDescription,
      locale: "en_US",
    },
    twitter: {
      card: "summary",
      title: page.metaTitle,
      description: page.metaDescription,
    },
  };
}

export default async function TargetToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getTargetPage(slug);
  if (!page) notFound();
  return <ToolPage page={page} />;
}
