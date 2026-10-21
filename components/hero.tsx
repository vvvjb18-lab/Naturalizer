"use client";

import { ArrowRight, Check, MessageCircle, Sparkles } from "lucide-react";

import { useSite } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { WHATSAPP_URL } from "@/lib/site";

/**
 * Hero: the value proposition, two order-focused actions, and a bilingual
 * before/after excerpt that makes the human edit tangible.
 */
export function Hero() {
  const { copy } = useSite();

  return (
    <section className="relative border-b border-border/60">
      <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-20 text-center md:pb-28 md:pt-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3.5 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          {copy.hero.badge}
        </span>

        <h1 className="mx-auto mt-7 max-w-4xl text-balance text-[2.5rem] font-semibold leading-[1.06] tracking-[-0.035em] text-foreground sm:text-6xl md:text-[4.25rem]">
          {copy.hero.titleA}
          <span className="mt-1 block text-muted-foreground">
            {copy.hero.titleB}
          </span>
        </h1>

        <p className="mx-auto mt-7 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
          {copy.hero.description}
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="w-full rounded-full sm:w-auto">
            <a href="#order">
              {copy.hero.primary}
              <ArrowRight aria-hidden="true" />
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full rounded-full sm:w-auto"
          >
            <a href="#pricing">{copy.hero.secondary}</a>
          </Button>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">{copy.hero.note}</p>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          {copy.common.whatsappCta}
        </a>

        <div className="mx-auto mt-16 max-w-3xl overflow-hidden rounded-2xl border border-border bg-card text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {copy.hero.previewLabel}
            </span>
            <span className="tabular-nums">{copy.hero.previewMeta}</span>
          </div>

          <div className="grid divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
            <div className="p-5 sm:p-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {copy.hero.beforeLabel}
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                {copy.hero.before}
              </p>
            </div>
            <div className="p-5 sm:p-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
                {copy.hero.afterLabel}
              </p>
              <p className="mt-3 text-[15px] font-medium leading-relaxed text-foreground">
                {copy.hero.after}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border px-5 py-3 text-xs text-muted-foreground">
            {copy.hero.checks.map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
