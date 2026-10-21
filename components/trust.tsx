"use client";

import Link from "next/link";
import {
  BadgeCheck,
  Calculator,
  LockKeyhole,
  ShieldAlert,
} from "lucide-react";

import { useSite } from "@/components/providers";

const icons = [BadgeCheck, Calculator, LockKeyhole, ShieldAlert];

/**
 * A compact trust section. It only states commitments the service can
 * actually keep: human review, a confirmed scope, confidentiality, and
 * no guarantees about grades or detector scores.
 */
export function Trust() {
  const { locale, copy } = useSite();

  return (
    <section id="about" className="border-b border-border/60 bg-muted/50">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 md:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-16">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {copy.trust.eyebrow}
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold leading-[1.15] tracking-[-0.02em] text-foreground sm:text-4xl">
            {copy.trust.title}
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
            {copy.trust.description}
          </p>
          <p className="mt-6 max-w-md text-xs leading-relaxed text-muted-foreground">
            {copy.trust.note}{" "}
            <Link
              href="/terms"
              className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary"
            >
              {copy.trust.terms}
            </Link>{" "}
            {copy.trust.and}{" "}
            <Link
              href="/privacy"
              className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary"
            >
              {copy.trust.privacy}
            </Link>
            {locale === "zh" ? "。" : "."}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {copy.trust.items.map((item, index) => {
            const Icon = icons[index] ?? BadgeCheck;

            return (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-background p-5"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon
                    className="h-4 w-4"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mt-4 text-sm font-medium tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
