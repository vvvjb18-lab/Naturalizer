"use client";

import Link from "next/link";
import { ExternalLink, MessageCircle } from "lucide-react";

import { useSite } from "@/components/providers";
import {
  CAROUSELL_LISTING_URL,
  CAROUSELL_SELLER_URL,
  SELLER_HANDLE,
  WHATSAPP_URL,
} from "@/lib/site";

/** Quiet footer with navigation, Carousell contact, and service disclaimers. */
export function SiteFooter() {
  const { copy } = useSite();

  const links = [
    { href: "/#services", label: copy.footer.services },
    { href: "/#about", label: copy.footer.about },
    { href: "/#pricing", label: copy.footer.pricing },
    { href: "/#order", label: copy.footer.order },
    { href: "/#faq", label: copy.footer.faq },
  ];

  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              className="text-[15px] font-semibold tracking-tight text-foreground"
            >
              Naturalizer<span className="text-primary">.</span>
            </Link>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {copy.footer.tagline}
            </p>
            <p className="mt-5 text-xs text-muted-foreground">
              {copy.footer.payment}:{" "}
              <span className="font-medium text-foreground">
                {copy.footer.paymentValue}
              </span>
            </p>
          </div>

          <nav className="flex flex-col gap-3" aria-label="Footer navigation">
            {links.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex flex-col items-start gap-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
              {copy.common.whatsapp}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            <a
              href={CAROUSELL_LISTING_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {copy.footer.carousell}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            <a
              href={CAROUSELL_SELLER_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {SELLER_HANDLE}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
              <Link
                href="/terms"
                className="transition-colors hover:text-foreground"
              >
                {copy.footer.terms}
              </Link>
              <Link
                href="/privacy"
                className="transition-colors hover:text-foreground"
              >
                {copy.footer.privacy}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border/60 pt-6">
          <p className="max-w-4xl text-xs leading-relaxed text-muted-foreground">
            {copy.footer.disclaimer}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            © {new Date().getFullYear()} {copy.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
