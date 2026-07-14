"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, FileImage, Minimize2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { GitHubMark } from "@/components/github-mark";
import { githubRepositoryUrl } from "@/lib/site";

const imageTools = [
  {
    href: "/compress-image-to-100kb",
    name: "Image Compressor",
    description: "Reduce an image to a target file size",
    icon: Minimize2,
  },
  {
    href: "/image-format-converter",
    name: "Image Converter",
    description: "Convert JPG, PNG, WebP, SVG and HEIC",
    icon: FileImage,
  },
];

export function SiteHeader() {
  const [toolsOpen, setToolsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeMenu(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setToolsOpen(false);
    }

    function closeMenuWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setToolsOpen(false);
    }

    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", closeMenuWithEscape);
    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("keydown", closeMenuWithEscape);
    };
  }, []);

  return (
    <header className="relative z-30 border-b border-border bg-background">
      <div className="site-container flex h-[72px] items-center justify-between px-5 sm:px-7 lg:h-[92px] lg:px-8">
        <Link
          href="/compress-image-to-100kb"
          className="flex items-center gap-2 text-[22px] font-bold tracking-[-0.045em] text-foreground lg:gap-2.5 lg:text-[28px]"
        >
          <Image
            src="/zestkit-logo.png"
            alt=""
            width={383}
            height={336}
            priority
            className="h-7 w-auto lg:h-8"
          />
          <span>Zestkit</span>
        </Link>

        <div className="flex items-center gap-2">
          <nav
            aria-label="Primary navigation"
            className="flex items-center gap-1 rounded-full bg-muted p-1.5 text-sm font-medium text-muted-foreground sm:gap-2 lg:text-base"
          >
            <div ref={menuRef} className="relative">
              <button
                type="button"
                aria-expanded={toolsOpen}
                aria-haspopup="menu"
                className="flex h-10 items-center gap-1.5 rounded-full px-3.5 transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-4"
                onClick={() => setToolsOpen((open) => !open)}
              >
                <span className="min-[360px]:hidden">Tools</span>
                <span className="hidden min-[360px]:inline">Image Tools</span>
                <ChevronDown
                  aria-hidden="true"
                  className={`size-4 transition-transform ${toolsOpen ? "rotate-180" : ""}`}
                />
              </button>

              {toolsOpen && (
                <div
                  role="menu"
                  className="fixed top-[84px] left-1/2 w-[calc(100vw-40px)] -translate-x-1/2 rounded-2xl border border-border bg-card p-2.5 shadow-[0_24px_70px_rgba(36,43,54,0.16)] sm:absolute sm:top-[calc(100%+12px)] sm:right-0 sm:left-auto sm:w-[340px] sm:translate-x-0"
                >
                  <p className="px-3 pt-1 pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Image tools
                  </p>
                  {imageTools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <Link
                        key={tool.href}
                        role="menuitem"
                        href={tool.href}
                        className="group flex items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none"
                        onClick={() => setToolsOpen(false)}
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-border bg-background text-primary transition-colors group-hover:border-primary/20">
                          <Icon aria-hidden="true" className="size-[18px]" />
                        </span>
                        <span className="min-w-0 pt-0.5">
                          <span className="block text-sm font-bold text-foreground">
                            {tool.name}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                            {tool.description}
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <a
              href="#privacy"
              className="hidden h-10 items-center rounded-full px-3.5 transition-colors hover:bg-card hover:text-foreground sm:flex"
            >
              Privacy
            </a>
            <a
              href="#faq"
              className="hidden h-10 items-center rounded-full px-3.5 transition-colors hover:bg-card hover:text-foreground sm:flex"
            >
              FAQ
            </a>
          </nav>

          <a
            href={githubRepositoryUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="View Zestkit on GitHub"
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-foreground/25 hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto sm:gap-2 sm:px-4"
          >
            <GitHubMark aria-hidden="true" className="size-[18px]" />
            <span className="hidden text-sm font-semibold sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
