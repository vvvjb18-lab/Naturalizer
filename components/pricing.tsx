import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/section-heading";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    description: "For trying a single paragraph.",
    features: [
      "1 sample document",
      "500 words",
      "Clarity and tone pass",
      "No account required",
    ],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Scholar",
    price: "$9",
    cadence: "per month",
    description: "For coursework and thesis chapters.",
    features: [
      "Unlimited documents",
      "25,000 words per month",
      "APA, MLA, and Chicago checks",
      "Change rationales on every edit",
      "Export with tracked changes",
    ],
    cta: "Choose Scholar",
    featured: true,
  },
  {
    name: "Lab",
    price: "$24",
    cadence: "per month",
    description: "For research groups and co-authors.",
    features: [
      "5 seats included",
      "150,000 words per month",
      "Shared style guide",
      "Priority processing",
      "Invoice billing",
    ],
    cta: "Contact us",
    featured: false,
  },
];

/**
 * Three plans with the middle tier inverted for emphasis. All CTAs point at
 * the interactive demo since there is no checkout in this build.
 */
export function Pricing() {
  return (
    <section id="pricing" className="border-b border-border/60">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 md:py-28">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple prices, no surprises."
          description="Start free on a paragraph. Upgrade only when a draft needs the full treatment."
        />

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-2xl border p-7",
                plan.featured
                  ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                  : "border-border bg-card"
              )}
            >
              {plan.featured ? (
                <Badge className="absolute -top-3 left-7">Most popular</Badge>
              ) : null}

              <h3
                className={cn(
                  "text-sm font-medium",
                  plan.featured ? "text-white/80" : "text-muted-foreground"
                )}
              >
                {plan.name}
              </h3>

              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-4xl font-semibold tracking-[-0.03em]">
                  {plan.price}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    plan.featured ? "text-white/60" : "text-muted-foreground"
                  )}
                >
                  {plan.cadence}
                </span>
              </div>

              <p
                className={cn(
                  "mt-2 text-sm",
                  plan.featured ? "text-white/70" : "text-muted-foreground"
                )}
              >
                {plan.description}
              </p>

              <Button
                asChild
                className="mt-6 w-full"
                variant={plan.featured ? "inverse" : "outline"}
              >
                <a href="#try">{plan.cta}</a>
              </Button>

              <ul
                className={cn(
                  "mt-7 space-y-3 border-t pt-6 text-sm",
                  plan.featured ? "border-white/15" : "border-border"
                )}
              >
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        plan.featured ? "text-white/70" : "text-primary"
                      )}
                      strokeWidth={2}
                    />
                    <span
                      className={
                        plan.featured ? "text-white/80" : "text-foreground"
                      }
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Prices in USD. Cancel anytime. Student pricing is already applied to
          the Scholar plan.
        </p>
      </div>
    </section>
  );
}
