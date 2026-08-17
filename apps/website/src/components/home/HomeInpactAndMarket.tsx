import { Sparkles, Users, Zap } from "lucide-react";

import { FadeIn, FadeInStagger } from "@/components/shared/FadeIn";
import { Heading, Plain } from "@/components/shared/Stage";

const facts = [
  {
    icon: Users,
    figure: "600M+",
    body: "people in Africa lack reliable electricity.",
  },
  {
    icon: Zap,
    figure: "Smart energy",
    body: "GridCore closes the gap by digitising and financing decentralised energy.",
  },
  {
    icon: Sparkles,
    figure: "Deployment",
    body: "with mini-grids, mesh grids, C&I sites, and community energy access.",
  },
];

const HomeInpactAndMarket = () => {
  return (
    <Plain className="py-20 md:py-28">
      <Heading
        tone="light"
        kicker="Impact & market"
        title="Powering Africa’s clean energy transformation."
        lede="Measurable impact across communities, infrastructure and sustainability."
      />

      <FadeInStagger className="mt-14 grid gap-6 md:grid-cols-3">
        {facts.map(({ icon: Icon, figure, body }) => (
          <FadeIn
            key={figure}
            className="rounded-xl border border-border bg-card p-6"
          >
            <span className="flex size-12 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
              <Icon className="size-6" aria-hidden />
            </span>
            <p className="mt-5 text-2xl font-semibold text-primary">{figure}</p>
            <p className="mt-1.5 text-sm text-primary/70">{body}</p>
          </FadeIn>
        ))}
      </FadeInStagger>
    </Plain>
  );
};

export default HomeInpactAndMarket;
