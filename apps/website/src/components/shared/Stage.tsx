import type { ReactNode } from "react";

// The site's two grounds, and the one section heading shape.
export function Stage({
  id,
  glow = "full",
  className = "",
  children,
}: {
  id?: string;
  glow?: "full" | "edge" | "none";
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`relative overflow-hidden bg-primary text-white ${className}`}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {glow !== "none" && (
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-secondary/40 to-transparent" />
        )}
        {glow === "full" && (
          <>
            <div className="absolute -left-40 top-0 size-136 rounded-full bg-secondary/10 blur-3xl" />
            <div className="absolute -right-32 bottom-0 size-112 rounded-full bg-secondary/7 blur-3xl" />
          </>
        )}
      </div>

      <div className="container relative">{children}</div>
    </section>
  );
}

// The light ground. Alternating with Stage is the rhythm; light is for reading.
export function Plain({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`bg-background ${className}`}>
      <div className="container">{children}</div>
    </section>
  );
}

// Left-aligned, three parts: kicker, title, optional lede.
export function Heading({
  kicker,
  title,
  lede,
  tone = "midnight",
}: {
  kicker?: string;
  title: string;
  lede?: ReactNode;
  tone?: "midnight" | "light";
}) {
  const onDark = tone === "midnight";

  return (
    <div className="max-w-2xl">
      {kicker && (
        <p
          className={`text-sm font-semibold uppercase tracking-widest ${
            onDark ? "text-secondary" : "text-primary/60"
          }`}
        >
          {kicker}
        </p>
      )}
      <h2
        className={`mt-3 text-3xl font-semibold sm:text-4xl ${
          onDark ? "text-white" : "text-primary"
        }`}
      >
        {title}
      </h2>
      {lede && (
        <p className={`mt-4 ${onDark ? "text-white/75" : "text-primary/70"}`}>
          {lede}
        </p>
      )}
    </div>
  );
}
