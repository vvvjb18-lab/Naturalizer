"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { useSite } from "@/components/providers";
import { privacyContent, termsContent } from "@/lib/legal";
import { CAROUSELL_LISTING_URL } from "@/lib/site";

/**
 * Renders the bilingual terms or privacy document. The legal copy lives in
 * lib/legal.ts so both languages stay structurally aligned.
 */
export function LegalPage({ document }: { document: "terms" | "privacy" }) {
  const { locale } = useSite();
  const doc =
    document === "terms" ? termsContent[locale] : privacyContent[locale];

  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-16 md:py-24">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {doc.back}
      </Link>

      <p className="mt-10 text-xs font-medium uppercase tracking-[0.18em] text-primary">
        {doc.eyebrow}
      </p>
      <h1 className="mt-3 text-balance text-3xl font-semibold leading-[1.15] tracking-[-0.02em] text-foreground sm:text-4xl">
        {doc.title}
      </h1>
      <p className="mt-3 text-xs text-muted-foreground">{doc.updated}</p>
      <p className="mt-6 text-base leading-relaxed text-muted-foreground">
        {doc.intro}
      </p>

      <div className="mt-10 space-y-10">
        {doc.sections.map((section) => (
          <section key={section.title} className="border-t border-border pt-7">
            <h2 className="text-lg font-medium tracking-tight text-foreground">
              {section.title}
            </h2>
            {section.paragraphs?.map((paragraph) => (
              <p
                key={paragraph}
                className="mt-3 text-sm leading-relaxed text-muted-foreground"
              >
                {paragraph}
              </p>
            ))}
            {section.bullets ? (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-border">
                {section.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-border bg-muted/40 p-6">
        <h2 className="text-base font-medium text-foreground">
          {doc.contactTitle}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {doc.contactText}
        </p>
        <a
          href={CAROUSELL_LISTING_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
        >
          {doc.contactCta}
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
