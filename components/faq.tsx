import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Will my writing still sound like me?",
    answer:
      "Yes — that is the main design constraint. Naturalizer works at the sentence level: it removes filler, untangles clauses, and fixes rhythm, but it does not swap in its own vocabulary. You approve every change.",
  },
  {
    question: "How is this different from a grammar checker?",
    answer:
      "A grammar checker asks whether a sentence is correct. Naturalizer asks whether it earns its place: is the claim clear, is the voice active, does the paragraph move. Grammar is the floor, not the goal.",
  },
  {
    question: "Do you store my drafts?",
    answer:
      "No. Documents are processed in memory and deleted when your session ends. We do not use customer text to train models, and we do not sell data.",
  },
  {
    question: "Can I use it for a thesis or dissertation?",
    answer:
      "Yes. Chapters up to 25,000 words are supported on the Scholar plan, and revisions export with tracked changes so your committee can see exactly what changed.",
  },
  {
    question: "Does Naturalizer help me avoid AI detectors?",
    answer:
      "No, and we make no claims about detector scores. Those tools are unreliable, and we will not build a product around gaming them. Our goal is clearer writing you can defend as your own.",
  },
  {
    question: "Is there a student discount?",
    answer:
      "The Scholar plan is already priced for students. If cost is a barrier, write to us with your institution and we will work something out.",
  },
];

/**
 * FAQ as a two-column block: a static intro on the left, a Radix accordion
 * on the right. The first item opens by default to signal interactivity.
 */
export function Faq() {
  return (
    <section id="faq" className="border-b border-border/60">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-20 md:py-28 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-[1.15] tracking-[-0.02em] text-foreground sm:text-4xl">
            Questions, answered.
          </h2>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-muted-foreground">
            The things students ask before pasting their first paragraph.
          </p>
          <p className="mt-6 text-sm text-muted-foreground">
            Still curious?{" "}
            <a
              href="mailto:hello@naturalizer.study"
              className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
            >
              hello@naturalizer.study
            </a>
          </p>
        </div>

        <Accordion type="single" collapsible defaultValue="item-0">
          {faqs.map((faq, index) => (
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
