"use client";

import { ExternalLink } from "lucide-react";

import { useSite } from "@/components/providers";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CAROUSELL_LISTING_URL } from "@/lib/site";

/**
 * FAQ as a two-column block: a static intro on the left, a Radix accordion
 * on the right. The first item opens by default to signal interactivity.
 */
export function Faq() {
  const { copy } = useSite();

  return (
    <section id="faq" className="border-b border-border/60">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-20 md:py-28 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {copy.faq.eyebrow}
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold leading-[1.15] tracking-[-0.02em] text-foreground sm:text-4xl">
            {copy.faq.title}
          </h2>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-muted-foreground">
            {copy.faq.description}
          </p>
          <p className="mt-6 text-sm text-muted-foreground">
            {copy.faq.contactPrompt}{" "}
            <a
              href={CAROUSELL_LISTING_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
            >
              {copy.faq.contactLink}
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </p>
        </div>

        <Accordion type="single" collapsible defaultValue="item-0">
          {copy.faq.items.map((faq, index) => (
            <AccordionItem key={faq.question} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
