import { Globe2, Layers, TrendingUp } from "lucide-react";

import { FadeIn, FadeInStagger } from "@/components/shared/FadeIn";
import MissionVision from "@/components/shared/MissionVision";
import { Heading, Plain } from "@/components/shared/Stage";

const pillars = [
  {
    icon: Globe2,
    title: "Pan-African reach",
    body: "Connecting energy systems across the continent.",
  },
  {
    icon: Layers,
    title: "Ecosystem approach",
    body: "An integrated digital and hardware solution.",
  },
  {
    icon: TrendingUp,
    title: "Scalable impact",
    body: "From pilot project to continental infrastructure.",
  },
];

const HomeAbout = () => {
  return (
    <Plain className="py-20 md:py-28">
      <Heading
        tone="light"
        kicker="About GridCore"
        title="Bridging clean energy and commercial sustainability."
        lede="A pan-African energy technology company. We provide an integrated digital and hardware ecosystem that empowers developers, utilities and financiers to deploy, manage and monetise distributed energy systems at scale."
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        <FadeInStagger className="flex flex-col gap-6">
          {pillars.map(({ icon: Icon, title, body }) => (
            <FadeIn
              key={title}
              className="flex flex-1 items-center gap-5 rounded-xl border border-border bg-card p-6"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary text-secondary">
                <Icon className="size-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-semibold text-primary">{title}</h3>
                <p className="mt-1 text-sm text-primary/70">{body}</p>
              </div>
            </FadeIn>
          ))}
        </FadeInStagger>

        <FadeIn className="relative min-h-80 overflow-hidden rounded-xl">
          <img
            src="/images/home-about.webp"
            alt="A solar array at sunset, with wind turbines on the horizon"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute bottom-6 left-6 rounded-lg bg-primary/95 p-5 backdrop-blur-sm">
            <span className="flex items-center gap-2 text-xs text-white/70">
              <span
                aria-hidden
                className="size-1.5 rounded-full bg-secondary"
              />
              Live energy data
            </span>
            <p className="mt-1 text-2xl font-semibold text-white">2.4 GW</p>
            <span className="text-xs text-white/70">Clean energy managed</span>
          </div>
        </FadeIn>
      </div>

      <div className="mt-6">
        <MissionVision />
      </div>
    </Plain>
  );
};

export default HomeAbout;
