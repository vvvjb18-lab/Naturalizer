import { Cta } from "@/components/cta";
import { Faq } from "@/components/faq";
import { Features } from "@/components/features";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { OrderSection } from "@/components/order-form";
import { Pricing } from "@/components/pricing";
import { ServicePromise } from "@/components/service-promise";
import { Trust } from "@/components/trust";
import { WhyDirect } from "@/components/why-direct";

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
      <Trust />
      <WhyDirect />
      <Pricing />
      <ServicePromise />
      <OrderSection />
      <Faq />
      <Cta />
    </>
  );
}
