import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Hero: one promise, two actions, and a single before/after excerpt so the
 * product's core value is legible without scrolling further.
 */
export function Hero() {
  return (
    <section className="relative border-b border-border/60">
      <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-20 text-center md:pb-28 md:pt-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3.5 py-1 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          For students and researchers
        </span>

        <h1 className="mx-auto mt-7 max-w-3xl text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.035em] text-foreground sm:text-6xl md:text-[4.25rem]">
          Clearer academic writing.
          <span className="mt-1 block text-muted-foreground">
            Still unmistakably yours.
          </span>
        </h1>

        <p className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Naturalizer edits your drafts for clarity, rhythm, and tone — without
          flattening your voice into boilerplate. Made for theses, seminar
          papers, and journal submissions.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="w-full rounded-full sm:w-auto">
            <a href="#try">
              Try a free sample
              <ArrowRight />
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full rounded-full sm:w-auto"
          >
            <a href="#pricing">See pricing</a>
          </Button>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          No account needed for the demo. Nothing is uploaded.
        </p>

        <div className="mx-auto mt-16 max-w-3xl overflow-hidden rounded-2xl border border-border bg-card text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Revision preview
            </span>
            <span className="tabular-nums">214 words → 133 words</span>
          </div>

          <div className="grid divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
            <div className="p-5 sm:p-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Before
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                The implementation of the proposed methodology was conducted in
                order to facilitate the enhancement of the overall performance
                metrics of the system under consideration.
              </p>
            </div>
            <div className="p-5 sm:p-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
                After
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-foreground">
                We implemented the method to{" "}
                <span className="decoration-primary/40 decoration-2 underline-offset-4 underline">
                  improve system performance
                </span>
                . This cut processing time by 18% across our test set.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border px-5 py-3 text-xs text-muted-foreground">
            {["Voice preserved", "38% shorter", "Passive voice removed"].map(
              (item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  {item}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
