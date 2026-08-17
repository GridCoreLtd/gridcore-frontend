import { Eye, Target } from "lucide-react";

import { FadeIn, FadeInStagger } from "@/components/shared/FadeIn";

// Stated on two pages; one component, so they cannot drift apart again.
export default function MissionVision() {
  return (
    <FadeInStagger className="grid gap-6 lg:grid-cols-2">
      <FadeIn className="flex flex-col rounded-xl bg-primary p-8">
        <span className="flex size-12 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
          <Target className="size-5" aria-hidden />
        </span>
        <h3 className="mt-5 text-2xl font-semibold text-white">Our mission</h3>
        <p className="mt-3 text-white/75">
          To optimise and orchestrate decentralised energy across Africa through
          intelligent infrastructure that empowers developers, utilities and
          users.
        </p>
        <div className="mt-auto pt-6">
          <p className="border-t border-white/15 pt-4 text-xs uppercase tracking-widest text-secondary">
            Impact goal
          </p>
          <p className="mt-1.5 text-white/85">
            Universal energy access by 2030
          </p>
        </div>
      </FadeIn>

      <FadeIn className="flex flex-col rounded-xl border border-border bg-secondary/15 p-8">
        <span className="flex size-12 items-center justify-center rounded-lg bg-primary text-secondary">
          <Eye className="size-5" aria-hidden />
        </span>
        <h3 className="mt-5 text-2xl font-semibold text-primary">Our vision</h3>
        <p className="mt-3 text-primary/75">
          To become Africa’s leading platform for real-time energy intelligence,
          unlocking universal access to affordable, clean power.
        </p>
        <div className="mt-auto pt-6">
          <p className="border-t border-primary/15 pt-4 text-xs uppercase tracking-widest text-primary/60">
            Market position
          </p>
          <p className="mt-1.5 text-primary/85">
            #1 energy intelligence platform
          </p>
        </div>
      </FadeIn>
    </FadeInStagger>
  );
}
