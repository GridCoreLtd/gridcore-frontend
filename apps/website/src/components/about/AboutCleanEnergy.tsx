import { Banknote, Coins, Zap } from "lucide-react";

import { FadeIn, FadeInStagger } from "@/components/shared/FadeIn";
import { Heading, Plain } from "@/components/shared/Stage";

// The three acts the platform performs, in the business's own terms.
const acts = [
  {
    icon: Banknote,
    step: "01",
    title: "A customer pays",
    body: "By card, transfer to their meter’s own account number, or a voucher — whichever their merchant offers.",
  },
  {
    icon: Zap,
    step: "02",
    title: "We vend the energy",
    body: "The payment becomes energy units at the meter’s tariff, and a 20-digit STS token the customer keys in.",
  },
  {
    icon: Coins,
    step: "03",
    title: "The merchant is settled",
    body: "The balance is held in their wallet, less commission, and paid out to their bank on their own schedule.",
  },
];

const AboutCleanEnergy = () => {
  return (
    <Plain className="py-20 md:py-28">
      <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <Heading
            tone="light"
            title="Bridging clean energy and commercial sustainability"
          />
          <FadeInStagger className="mt-6 flex flex-col gap-5 text-primary/70">
            <FadeIn>
              <p>
                GridCore Technologies Ltd. is a Nigerian energy technology
                company powering the next generation of decentralised energy
                infrastructure in Africa.
              </p>
            </FadeIn>
            <FadeIn>
              <p>
                We provide an integrated digital platform that allows energy
                developers, utilities and financiers to deploy, manage and
                monetise distributed energy systems at scale.
              </p>
            </FadeIn>
            <FadeIn>
              <p>
                Our platform simplifies how energy is measured, billed,
                optimised and financed — combining smart metering, billing
                systems, AI-powered dispatch, embedded finance and seamless
                integration into one cohesive ecosystem.
              </p>
            </FadeIn>
          </FadeInStagger>

          <FadeIn className="mt-10 rounded-xl bg-secondary/20 p-6">
            <h3 className="text-lg font-semibold text-primary">Our purpose</h3>
            <p className="mt-2 text-primary/75">
              We exist to bridge the gap between clean energy generation and
              commercial sustainability, helping Africa leapfrog to a
              decentralised, intelligent energy future.
            </p>
          </FadeIn>
        </div>

        <FadeInStagger className="flex flex-col gap-4">
          <FadeIn>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary/60">
              How it works
            </p>
          </FadeIn>
          {acts.map(({ icon: Icon, step, title, body }, i) => (
            <FadeIn key={step} className="relative">
              <div className="flex gap-5 rounded-xl border border-border bg-card p-6">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary text-secondary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-xs font-semibold tracking-widest text-primary/45">
                    {step}
                  </p>
                  <h3 className="mt-1 font-semibold text-primary">{title}</h3>
                  <p className="mt-1.5 text-sm text-primary/70">{body}</p>
                </div>
              </div>
              {i < acts.length - 1 && (
                <span
                  aria-hidden
                  className="ml-11 block h-4 w-px bg-border"
                />
              )}
            </FadeIn>
          ))}
        </FadeInStagger>
      </div>
    </Plain>
  );
};

export default AboutCleanEnergy;
