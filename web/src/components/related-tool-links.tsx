import Link from "next/link";

import { targetPages, type TargetPage } from "@/config/target-pages";

export function RelatedToolLinks({ currentPage }: { currentPage: TargetPage }) {
  return (
    <nav
      aria-label="Related image compression tools"
      className="flex flex-col gap-3 border-y border-border py-4 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8"
    >
      <span className="font-semibold text-muted-foreground">Related tools</span>
      {targetPages
        .filter((page) => page.slug !== currentPage.slug)
        .map((page) => (
          <Link
            key={page.slug}
            href={`/${page.slug}`}
            className="min-h-8 font-semibold text-primary underline-offset-4 hover:underline"
          >
            Compress image to {page.targetLabel}
          </Link>
        ))}
    </nav>
  );
}
