import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Sticky top navigation. Keeps the demo CTA visible at every scroll depth;
 * section links collapse on small screens where the CTA matters more.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-[17px] font-semibold tracking-tight text-foreground"
        >
          Naturalizer<span className="text-primary">.</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {[
            { href: "#features", label: "Features" },
            { href: "#how-it-works", label: "How it works" },
            { href: "#pricing", label: "Pricing" },
            { href: "#faq", label: "FAQ" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <Button asChild size="sm" className="rounded-full px-4">
          <a href="#try">
            Try it free
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </Button>
      </div>
    </header>
  );
}
