import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Closing call to action. A single dark panel at the end of an otherwise
 * white page gives the scroll a clear destination without extra decoration.
 */
export function Cta() {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 md:py-24">
        <div className="rounded-3xl bg-slate-900 px-6 py-16 text-center sm:px-12">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/50">
            Start small
          </p>
          <h2 className="mx-auto mt-4 max-w-xl text-3xl font-semibold leading-[1.15] tracking-[-0.02em] text-white sm:text-4xl">
            Start with a paragraph.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-white/70">
            Paste 200 words and see what a careful edit looks like. No account,
            no upload, no commitment.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              variant="inverse"
              className="w-full rounded-full sm:w-auto"
            >
              <a href="#try">
                Try the free sample
                <ArrowRight />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="inverse-outline"
              className="w-full rounded-full sm:w-auto"
            >
              <a href="#pricing">View plans</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
