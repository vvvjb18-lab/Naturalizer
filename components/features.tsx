import {
  BookMarked,
  Fingerprint,
  ListChecks,
  ScrollText,
} from "lucide-react";

import { SectionHeading } from "@/components/section-heading";

const features = [
  {
    icon: Fingerprint,
    title: "Keeps your voice",
    description:
      "Edits are suggestions, not replacements. Your argument, cadence, and vocabulary stay intact — only the friction goes.",
  },
  {
    icon: ScrollText,
    title: "Built for academic prose",
    description:
      "Tuned on journal articles, theses, and seminar papers. It knows the difference between concise and clipped.",
  },
  {
    icon: ListChecks,
    title: "Explains every change",
    description:
      "Each suggestion comes with a one-line rationale, so you learn the edit instead of just accepting it.",
  },
  {
    icon: BookMarked,
    title: "Citation-aware",
    description:
      "Checks APA, MLA, and Chicago formatting so your references match the rest of the paper.",
  },
];

/**
 * Four capability cards on a quiet gray band, separating the hero
 * from the interactive demo below.
 */
export function Features() {
  return (
    <section id="features" className="border-b border-border/60 bg-muted/50">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 md:py-28">
        <SectionHeading
          eyebrow="Why Naturalizer"
          title="Editing that respects the work behind the writing."
          description="Most tools optimize for sounding generic. We optimize for sounding like a careful version of you."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border bg-background p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/60">
                <feature.icon
                  className="h-[18px] w-[18px] text-foreground"
                  strokeWidth={1.75}
                />
              </div>
              <h3 className="mt-5 text-[15px] font-medium tracking-tight text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
