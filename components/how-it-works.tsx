"use client";

import { ArrowRight } from "lucide-react";

import { useSite } from "@/components/providers";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";

/**
 * Three-step explainer. Thin top rules and numeric markers form the
 * connector without adding decorative arrows.
 */
export function HowItWorks() {
  const { copy } = useSite();
  const numbers = ["01", "02", "03"];

  return (
    <section id="process" className="border-b border-border/60">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 md:py-28">
        <SectionHeading
          eyebrow={copy.process.eyebrow}
          title={copy.process.title}
          description={copy.process.description}
        />

        <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
          {copy.process.steps.map((step, index) => (
            <div
              key={step.title}
              className="relative border-t border-border pt-7"
            >
              <span className="absolute -top-4 left-0 inline-flex h-8 items-center rounded-full border border-border bg-background px-3 text-xs font-medium tabular-nums text-muted-foreground">
                {numbers[index]}
              </span>
              <h3 className="text-lg font-medium tracking-tight text-foreground">
                {step.title}
              </h3>
              <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-5 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">{copy.process.note}</p>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <a href="#order">
              {copy.nav.cta}
              <ArrowRight aria-hidden="true" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
