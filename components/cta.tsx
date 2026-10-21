"use client";

import { ArrowRight, ExternalLink, MessageCircle } from "lucide-react";

import { useSite } from "@/components/providers";
import { Button } from "@/components/ui/button";
import {
  CAROUSELL_LISTING_URL,
  WHATSAPP_URL,
} from "@/lib/site";

/**
 * Closing call to action. A single inverted panel gives the scroll a clear
 * destination without introducing another accent colour.
 */
export function Cta() {
  const { copy } = useSite();

  return (
    <section className="border-b border-border/60">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 md:py-24">
        <div className="rounded-3xl bg-foreground px-6 py-16 text-center text-background sm:px-12">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-background/55">
            {copy.cta.eyebrow}
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl text-balance text-3xl font-semibold leading-[1.15] tracking-[-0.02em] sm:text-4xl">
            {copy.cta.title}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-background/70">
            {copy.cta.description}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="w-full rounded-full sm:w-auto"
            >
              <a href="#order">
                {copy.cta.primary}
                <ArrowRight aria-hidden="true" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full rounded-full border-background/25 bg-transparent text-background hover:bg-background/10 hover:text-background sm:w-auto"
            >
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                {copy.cta.secondary}
                <MessageCircle aria-hidden="true" />
              </a>
            </Button>
          </div>
          <p className="mt-5 text-xs text-background/55">{copy.cta.note}</p>
          <a
            href={CAROUSELL_LISTING_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-background/60 underline decoration-background/20 underline-offset-4 transition-colors hover:text-background"
          >
            {copy.common.viewCarousell}
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
