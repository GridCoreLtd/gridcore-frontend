import { ArrowUpRight } from "lucide-react";

import { FadeIn, FadeInStagger } from "@/components/shared/FadeIn";
import type { EcosystemModule } from "@/utils/modules";

// One image treatment, so six unrelated photographs read as a set. The dark
// image header over a light body is the card on every page that shows them.
function Card({ module: m }: { module: EcosystemModule }) {
  return (
    <FadeIn className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/30">
      <div className="relative h-44 overflow-hidden">
        <img
          src={m.img}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="size-full object-cover grayscale transition duration-500 group-hover:scale-105"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-primary/65 mix-blend-multiply"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-primary via-primary/40 to-transparent"
        />
        <p className="absolute bottom-3 left-4 text-xs font-medium uppercase tracking-widest text-secondary">
          {m.role}
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-xl font-semibold text-primary">{m.name}</h3>
        <p className="text-sm text-primary/70">{m.description}</p>

        <div className="mt-auto pt-4">
          {m.available ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              Available now
              <ArrowUpRight className="size-4" aria-hidden />
            </span>
          ) : (
            // A fact, not a disabled button: a greyed-out control invites a
            // click that can never work.
            <span className="inline-flex items-center gap-2 text-sm text-primary/45">
              <span aria-hidden className="size-1.5 rounded-full bg-primary/25" />
              In development
            </span>
          )}
        </div>
      </div>
    </FadeIn>
  );
}

export default function ModuleGrid({
  modules,
}: {
  modules: EcosystemModule[];
}) {
  return (
    <FadeInStagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((m) => (
        <Card key={m.slug} module={m} />
      ))}
    </FadeInStagger>
  );
}
