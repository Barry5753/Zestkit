import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { GitHubMark } from "@/components/github-mark";
import { githubRepositoryUrl } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="site-container grid gap-7 px-5 py-8 text-sm sm:grid-cols-[1fr_auto] sm:items-end lg:px-8">
        <div>
          <p className="font-semibold text-foreground">
            Zestkit — private image tools you can inspect.
          </p>
          <p className="mt-2 text-muted-foreground">
            No uploads · No account · No payment
          </p>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link
            href="/open-source"
            className="font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Open Source
          </Link>
          <a
            href={githubRepositoryUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            <GitHubMark aria-hidden="true" className="size-4" />
            GitHub
            <ExternalLink aria-hidden="true" className="size-3" />
          </a>
          <a
            href={`${githubRepositoryUrl}/blob/main/LICENSE`}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            MIT License
          </a>
        </nav>
      </div>
    </footer>
  );
}
