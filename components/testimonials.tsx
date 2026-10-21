import { SectionHeading } from "@/components/section-heading";

const testimonials = [
  {
    quote:
      "My supervisor said the draft finally sounded like me — just tighter. That is exactly the edit I had been trying to make myself for weeks.",
    name: "Maya R.",
    role: "PhD candidate, sociology",
  },
  {
    quote:
      "I use it before every submission now. The rationale notes taught me more about concision than any style guide I have read.",
    name: "Daniel K.",
    role: "MSc student, public health",
  },
  {
    quote:
      "The citation checks alone saved me an afternoon on my literature review. The prose pass was a welcome bonus.",
    name: "Priya S.",
    role: "Undergraduate, economics",
  },
];

/**
 * Three short quotes. Kept deliberately plain: no avatars, no star ratings,
 * nothing that competes with the words.
 */
export function Testimonials() {
  return (
    <section className="border-b border-border/60 bg-muted/50">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 md:py-28">
        <SectionHeading
          eyebrow="From the margins"
          title="What students notice first."
          description="The most common feedback is not about speed. It is that the revision still sounds like theirs."
        />

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <figure
              key={item.name}
              className="flex flex-col justify-between rounded-xl border border-border bg-background p-6"
            >
              <blockquote className="text-[15px] leading-relaxed text-foreground">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-6 border-t border-border pt-4">
                <p className="text-sm font-medium text-foreground">
                  {item.name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.role}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
