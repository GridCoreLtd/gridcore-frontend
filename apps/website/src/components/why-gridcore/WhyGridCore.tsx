import {
  BrainCircuit,
  GraduationCap,
  Map,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { FadeIn, FadeInStagger } from "@/components/shared/FadeIn";
import { Heading, Stage } from "@/components/shared/Stage";

// Five reasons, five identical cards.
const reasons = [
  {
    icon: BrainCircuit,
    title: "End-to-end intelligence",
    body: "AI forecasting, real-time dashboards and anomaly detection.",
  },
  {
    icon: Wallet,
    title: "Seamless payments",
    body: "Embedded finance with mobile money, wallets and APIs.",
  },
  {
    icon: ShieldCheck,
    title: "Resilient infrastructure",
    body: "Edge-first design for offline resilience and data security.",
  },
  {
    icon: GraduationCap,
    title: "Capacity building",
    body: "Local skills development through GridAcademy.",
  },
  {
    icon: Map,
    title: "Pan-African scalability",
    body: "Built for diverse contexts across Sub-Saharan Africa.",
  },
];

const WhyGridCore = () => {
  return (
    <Stage className="py-20 md:py-28">
      <Heading
        kicker="Why GridCore"
        title="Built for how energy actually works here."
      />

      <FadeInStagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {reasons.map(({ icon: Icon, title, body }) => (
          <FadeIn
            key={title}
            className="rounded-xl border border-white/10 bg-white/3 p-6 transition hover:border-secondary/40"
          >
            <span className="flex size-12 items-center justify-center rounded-lg bg-secondary/15 text-secondary">
              <Icon className="size-6" aria-hidden />
            </span>
            <h3 className="mt-5 font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm text-white/70">{body}</p>
          </FadeIn>
        ))}
      </FadeInStagger>
    </Stage>
  );
};

export default WhyGridCore;
