"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Strength = "Light" | "Balanced" | "Thorough";
type Status = "idle" | "loading" | "done";

const strengths: Strength[] = ["Light", "Balanced", "Thorough"];

/**
 * Interactive trial area. Everything runs in the browser: the "submission"
 * is a timed simulation, so no API, storage, or network request is involved.
 */
export function TryDemo() {
  const [text, setText] = useState("");
  const [strength, setStrength] = useState<Strength>("Balanced");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear the pending timer if the component unmounts mid-simulation.
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;

    if (words < 8) {
      setError("Add at least a sentence or two so there is something to edit.");
      return;
    }

    setError(null);
    setStatus("loading");
    timer.current = setTimeout(() => setStatus("done"), 1100);
  }

  function handleReset() {
    if (timer.current) clearTimeout(timer.current);
    setStatus("idle");
    setError(null);
  }

  return (
    <section id="try" className="border-b border-border/60">
      <div className="mx-auto grid w-full max-w-6xl items-start gap-12 px-6 py-20 md:py-28 lg:grid-cols-[0.85fr_1fr] lg:gap-16">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Free sample
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-[1.15] tracking-[-0.02em] text-foreground sm:text-4xl">
            See it on your own paragraph.
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
            Paste a passage you are stuck on. You will see the kind of edit
            Naturalizer makes — and the reasoning behind it.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
            {[
              "Your draft stays in your browser",
              "No sign-up, no email required",
              "Works across disciplines and citation styles",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                  strokeWidth={1.75}
                />
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-8 max-w-sm border-l-2 border-border pl-4 text-xs leading-relaxed text-muted-foreground">
            This page is a front-end demonstration. Submissions are simulated —
            nothing is sent, scored, or stored.
          </p>
        </div>

        <div className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-6">
          <form onSubmit={handleSubmit} noValidate>
            <div className="flex items-center justify-between">
              <label
                htmlFor="draft"
                className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground"
              >
                Your draft
              </label>
              <span className="text-xs tabular-nums text-muted-foreground">
                {words} {words === 1 ? "word" : "words"}
              </span>
            </div>

            <Textarea
              id="draft"
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                if (error) setError(null);
                if (status === "done") setStatus("idle");
              }}
              placeholder="Paste a paragraph from a draft you are working on…"
              className="mt-3 min-h-[168px] resize-none"
              aria-describedby="draft-hint"
            />
            <p id="draft-hint" className="sr-only">
              The text is used only for this on-page demonstration.
            </p>

            <div className="mt-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Edit strength
              </p>
              <div
                className="mt-2.5 flex flex-wrap gap-2"
                role="group"
                aria-label="Edit strength"
              >
                {strengths.map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={strength === option}
                    onClick={() => setStrength(option)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      strength === option
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={status === "loading"}
              className="mt-6 w-full rounded-lg"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="animate-spin" />
                  Reading for clarity…
                </>
              ) : (
                <>
                  <Wand2 />
                  Polish my paragraph
                </>
              )}
            </Button>

            {error ? (
              <p role="alert" className="mt-3 text-xs text-destructive">
                {error}
              </p>
            ) : null}
          </form>

          {status === "done" ? (
            <div
              aria-live="polite"
              className="mt-5 animate-in fade-in-0 slide-in-from-bottom-1 duration-300"
            >
              <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-emerald-900">
                    Sample received
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-emerald-800">
                    {words} words · {strength.toLowerCase()} edit. In the full
                    product you would review suggestions line by line here.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-border bg-muted/40 p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Example output
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground">
                  “We implemented the method to improve system performance. This
                  cut processing time by 18% across our test set.”
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Rewritten for active voice and concision; the claim and its
                  evidence are unchanged.
                </p>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="mt-4 text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Edit another paragraph
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
