import { SectionHeading } from "@/components/section-heading";

const steps = [
  {
    number: "01",
    title: "Paste your draft",
    description:
      "Drop in a paragraph, a section, or a full chapter. Your text is processed and discarded — never stored or used for training.",
  },
  {
    number: "02",
    title: "Set the focus",
    description:
      "Choose your discipline, the target publication, and how heavy-handed the edit should be. Light touch or thorough rewrite.",
  },
  {
    number: "03",
    title: "Review, then keep",
    description:
      "Accept suggestions one at a time, or export a clean revision with tracked changes to share with your supervisor.",
  },
];

/**
 * Three-step explainer. The thin top rules and numeric markers form the
 * connector, avoiding arrows or decorative flourishes.
 */
export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-border/60">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 md:py-28">
        <SectionHeading
          eyebrow="How it works"
          title="A careful second pass, in three steps."
          description="No new writing app to learn. Naturalizer fits into the draft you already have."
        />

        <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative border-t border-border pt-7"
            >
              <span className="absolute -top-4 left-0 inline-flex h-8 items-center rounded-full border border-border bg-background px-3 text-xs font-medium tabular-nums text-muted-foreground">
                {step.number}
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
      </div>
    </section>
  );
}
