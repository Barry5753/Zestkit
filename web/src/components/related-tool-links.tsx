import Link from "next/link";

export type RelatedToolLink = {
  href: string;
  primaryText: string;
  secondaryText: string;
};

export function RelatedToolLinks({
  ariaLabel,
  links,
}: {
  ariaLabel: string;
  links: RelatedToolLink[];
}) {
  return (
    <nav
      aria-label={ariaLabel}
      className="grid grid-cols-2 gap-3 py-4 sm:grid-cols-4 lg:grid-cols-[116px_repeat(4,minmax(0,1fr))]"
    >
      <span className="col-span-2 flex items-center text-sm font-semibold text-muted-foreground sm:col-span-4 lg:col-span-1">
        Related tools
      </span>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="group flex min-h-[76px] flex-col items-start justify-center rounded-[10px] border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span className="order-2 mt-1 text-xs font-medium text-muted-foreground">
            {link.secondaryText}
          </span>
          <span className="order-1 text-xl leading-6 font-bold tracking-[-0.025em] text-foreground transition-colors group-hover:text-primary">
            {link.primaryText}
          </span>
        </Link>
      ))}
    </nav>
  );
}
