"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

import { useSite } from "@/components/providers";
import { LanguageToggle, ThemeToggle } from "@/components/site-controls";
import { Button } from "@/components/ui/button";
import { CAROUSELL_LISTING_URL } from "@/lib/site";

/**
 * Sticky navigation. Language and theme controls stay visible at every
 * breakpoint; the section links appear once there is room for them.
 */
export function SiteHeader() {
  const { copy } = useSite();

  const links = [
    { href: "/#services", label: copy.nav.services },
    { href: "/#process", label: copy.nav.process },
    { href: "/#about", label: copy.nav.about },
    { href: "/#pricing", label: copy.nav.pricing },
    { href: "/#faq", label: copy.nav.faq },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="shrink-0 text-[17px] font-semibold tracking-tight text-foreground"
        >
          Naturalizer<span className="text-primary">.</span>
        </Link>

        <nav
          className="hidden items-center gap-7 lg:flex"
          aria-label="Main navigation"
        >
          {links.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <a
            href={CAROUSELL_LISTING_URL}
            target="_blank"
            rel="noreferrer"
            className="mr-1 hidden items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground xl:inline-flex"
          >
            {copy.common.carousell}
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
          <LanguageToggle />
          <ThemeToggle />
          <Button asChild size="sm" className="rounded-full px-3 sm:px-4">
            <a href="/#order">
              <span className="hidden sm:inline">{copy.nav.cta}</span>
              <span className="sm:hidden">{copy.nav.ctaShort}</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
