"use client";

import { ArrowUpRight, Calculator } from "lucide-react";

import { useSite } from "@/components/providers";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CAROUSELL_LISTING_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Transparent tiered prices. The table is the source of truth on the page;
 * the examples make the progressive calculation concrete.
 */
export function Pricing() {
  const { copy } = useSite();

  return (
    <section id="pricing" className="border-b border-border/60">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 md:py-28">
        <SectionHeading
          eyebrow={copy.pricing.eyebrow}
          title={copy.pricing.title}
          description={copy.pricing.description}
        />

        <div className="mt-7 flex justify-center">
          <a
            href={CAROUSELL_LISTING_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Calculator className="h-3.5 w-3.5" aria-hidden="true" />
            {copy.pricing.estimateLabel}
            <span className="font-medium text-foreground underline decoration-border underline-offset-4">
              {copy.pricing.carousellLink}
            </span>
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>

        <p className="mx-auto mt-4 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">
          {copy.pricing.turnitinNote}
        </p>

        <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">
                  {copy.pricing.rangeHeader}
                </th>
                <th className="px-5 py-3 font-medium">
                  {copy.pricing.rateHeader}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {copy.pricing.tiers.map((tier, index) => (
                <tr
                  key={tier.range}
                  className={cn(index === 0 && "bg-primary/[0.04]")}
                >
                  <td className="px-5 py-4 font-medium text-foreground">
                    {tier.range}
                  </td>
                  <td className="px-5 py-4 text-foreground">
                    <span className="tabular-nums">{tier.rate}</span>
                    {tier.note ? (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {tier.note}
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-8 text-center text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {copy.pricing.examplesLabel}
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {copy.pricing.examples.map((example) => (
            <Card key={example.words} className="p-5 shadow-none">
              <p className="text-xs text-muted-foreground">{example.words}</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                {example.amount}
              </p>
            </Card>
          ))}
        </div>

        <div className="mt-7 flex justify-center">
          <Button asChild size="lg" className="rounded-full">
            <a href="#order">{copy.pricing.cta}</a>
          </Button>
        </div>

        <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-relaxed text-muted-foreground">
          {copy.pricing.note}
        </p>
      </div>
    </section>
  );
}
