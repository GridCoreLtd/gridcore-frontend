import type { ReactNode } from "react";

import { FadeIn, FadeInStagger } from "@/components/shared/FadeIn";

// The hero for every page below the home page.
export default function PageHero({
  kicker,
  title,
  lede,
  children,
}: {
  kicker?: string;
  title: string;
  lede?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-primary pb-20 pt-32 md:pb-24 md:pt-36">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 size-160 -translate-x-1/2 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-secondary/30 to-transparent" />
      </div>

      <div className="container relative">
        <FadeInStagger className="mx-auto max-w-3xl text-center">
          {kicker && (
            <FadeIn>
              <p className="text-sm font-semibold uppercase tracking-widest text-secondary">
                {kicker}
              </p>
            </FadeIn>
          )}
          <FadeIn>
            <h1 className="mt-4 text-4xl/[3rem] font-semibold text-white md:text-5xl/[3.75rem]">
              {title}
            </h1>
          </FadeIn>
          {lede && (
            <FadeIn>
              <p className="mx-auto mt-5 max-w-2xl text-white/75">{lede}</p>
            </FadeIn>
          )}
          {children && (
            <FadeIn className="mt-9 flex flex-wrap justify-center gap-4">
              {children}
            </FadeIn>
          )}
        </FadeInStagger>
      </div>
    </section>
  );
}
