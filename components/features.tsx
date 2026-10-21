"use client";

import {
  FileCheck2,
  Languages,
  PenLine,
  ShieldCheck,
} from "lucide-react";

import { useSite } from "@/components/providers";
import { SectionHeading } from "@/components/section-heading";
import { Card } from "@/components/ui/card";

const icons = [PenLine, ShieldCheck, Languages, FileCheck2];

/** Four service pillars, written around real delivery promises. */
export function Features() {
  const { copy } = useSite();

  return (
    <section id="services" className="border-b border-border/60 bg-muted/50">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 md:py-28">
        <SectionHeading
          eyebrow={copy.features.eyebrow}
          title={copy.features.title}
          description={copy.features.description}
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {copy.features.items.map((feature, index) => {
            const Icon = icons[index] ?? PenLine;

            return (
              <Card
                key={feature.title}
                className="border-border bg-background p-6 shadow-none"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon
                    className="h-[18px] w-[18px]"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mt-5 text-[15px] font-medium tracking-tight text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
