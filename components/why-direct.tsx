"use client";

import {
  ClipboardList,
  ExternalLink,
  Gauge,
  Store,
} from "lucide-react";

import { useSite } from "@/components/providers";
import { SectionHeading } from "@/components/section-heading";
import { CAROUSELL_LISTING_URL } from "@/lib/site";

const icons = [Gauge, ClipboardList, Store];

/**
 * Explains why the site exists alongside Carousell: faster quoting and a
 * structured brief, without forcing buyers away from the marketplace.
 */
export function WhyDirect() {
  const { copy } = useSite();

  return (
    <section className="border-b border-border/60 bg-muted/50">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 md:py-28">
        <SectionHeading
          eyebrow={copy.whyDirect.eyebrow}
          title={copy.whyDirect.title}
          description={copy.whyDirect.description}
        />

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {copy.whyDirect.items.map((item, index) => {
            const Icon = icons[index] ?? Gauge;

            return (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-background p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon
                    className="h-[18px] w-[18px]"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mt-5 text-[15px] font-medium tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-background p-6 sm:p-8">
          <p className="text-center text-sm font-medium text-foreground">
            {copy.whyDirect.comparisonTitle}
          </p>

          <div className="mt-6 grid items-center gap-5 md:grid-cols-[1fr_auto_1fr]">
            <div className="text-center md:text-right">
              <p className="text-sm font-medium text-foreground">
                {copy.whyDirect.directLabel}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {copy.whyDirect.directDescription}
              </p>
            </div>

            <div className="justify-self-center rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
              {copy.whyDirect.comparisonBadge}
            </div>

            <a
              href={CAROUSELL_LISTING_URL}
              target="_blank"
              rel="noreferrer"
              className="group text-center transition-colors hover:text-primary md:text-left"
            >
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground group-hover:text-primary">
                {copy.whyDirect.carousellLabel}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {copy.whyDirect.carousellDescription}
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
