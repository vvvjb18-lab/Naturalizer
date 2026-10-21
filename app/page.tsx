import { Cta } from "@/components/cta";
import { Faq } from "@/components/faq";
import { Features } from "@/components/features";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { Pricing } from "@/components/pricing";
import { Testimonials } from "@/components/testimonials";
import { TryDemo } from "@/components/try-demo";

/**
 * Landing page composition. Each section owns its own layout and copy;
 * this file only decides the reading order.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <TryDemo />
      <Testimonials />
      <Pricing />
      <Faq />
      <Cta />
    </>
  );
}
