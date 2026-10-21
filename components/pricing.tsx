"use client";

import { ArrowUpRight, Calculator, Check } from "lucide-react";

import { useSite } from "@/components/providers";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatHKD } from "@/lib/pricing";
import { CAROUSELL_LISTING_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

const planPrices = [65, 85, 170];

/**
 * Three transparent price points calculated from word count. The middle
 * plan is highlighted with a border and badge rather than a second palette.
 */
export function Pricing() {
  const { locale, copy } = useSite();

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

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {copy.pricing.plans.map((plan, index) => {
            const featured = index === 1;

            return (
              <Card
                key={plan.name}
                className={cn(
                  "relative flex flex-col p-7 shadow-none",
                  featured && "border-primary/60 ring-1 ring-primary/60"
                )}
              >
                {featured ? (
                  <Badge className="absolute -top-3 left-7">
                    {copy.pricing.mostPopular}
                  </Badge>
                ) : null}

                <h3 className="text-sm font-medium text-muted-foreground">
                  {plan.name}
                </h3>

                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-4xl font-semibold tracking-[-0.03em] text-foreground">
                    {formatHKD(planPrices[index], locale)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {plan.cadence}
                  </span>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {plan.description}
                </p>

                <Button
                  asChild
                  className="mt-6 w-full"
                  variant={featured ? "default" : "outline"}
                >
                  <a href="#order">{copy.pricing.cta}</a>
                </Button>

                <ul className="mt-7 space-y-3 border-t border-border pt-6 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>

        <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-relaxed text-muted-foreground">
          {copy.pricing.note}
        </p>
      </div>
    </section>
  );
}
