import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background">
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
        <nav
          aria-label="Primary navigation"
          className="flex items-center gap-5 rounded-full bg-muted px-4 py-3 text-sm font-medium text-muted-foreground sm:gap-7 sm:px-5 lg:gap-8 lg:px-6 lg:text-base"
        >
          <Link
            href="/compress-image-to-100kb"
            className="hidden transition-colors hover:text-foreground sm:inline"
          >
            Image Compressor
          </Link>
          <a href="#privacy" className="transition-colors hover:text-foreground">
            Privacy
          </a>
          <a href="#faq" className="transition-colors hover:text-foreground">
            FAQ
          </a>
        </nav>
      </div>
    </header>
  );
}
