import type { ComponentPropsWithoutRef, CSSProperties } from "react";

/**
 * Scroll-triggered fade-and-rise, with no client-side framework.
 *
 * The framer-motion version required hydrating React for every section, which
 * defeats the point of a static marketing site. This emits plain markup plus
 * data attributes; `src/styles/reveal.css` does the animation and a small
 * inline observer in Layout.astro flips the state. Astro renders these to HTML
 * at build time and ships no component JavaScript at all.
 *
 * The call-site API is unchanged.
 */

type TransitionProps = {
  duration?: number;
  staggerChildren?: number;
};

type FadeInProps = ComponentPropsWithoutRef<"div"> & {
  transition?: TransitionProps;
  offset?: number;
};

export function FadeIn({
  transition,
  offset = 24,
  style,
  ...props
}: FadeInProps) {
  return (
    <div
      data-reveal=""
      style={
        {
          ...style,
          "--reveal-offset": `${offset}px`,
          "--reveal-duration": `${transition?.duration ?? 0.5}s`,
        } as CSSProperties
      }
      {...props}
    />
  );
}

type FadeInStaggerProps = ComponentPropsWithoutRef<"div"> & {
  transition?: TransitionProps;
  faster?: boolean;
};

export function FadeInStagger({
  transition,
  faster = false,
  style,
  ...props
}: FadeInStaggerProps) {
  const step = transition?.staggerChildren ?? (faster ? 0.12 : 0.2);

  return (
    <div
      data-reveal-stagger=""
      style={{ ...style, "--reveal-step": `${step}s` } as CSSProperties}
      {...props}
    />
  );
}
