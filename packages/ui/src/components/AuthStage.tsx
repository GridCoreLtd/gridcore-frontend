import type { ReactNode } from "react";

/**
 * The "midnight stage" auth frame (backend architecture, blueprint 32 §11):
 * a deep navy backdrop with layered glows and pendant filament bulbs — one
 * lit — and a single floating card with a mark tile crowning it.
 *
 * Shared because both apps stage their auth on it; each skins it — the portal
 * with the merchant's identity, the console with GridCore's. The tile, kicker,
 * and footline are the whole of the difference.
 */
export default function AuthStage({
  tile,
  kicker,
  title,
  subtitle,
  footer,
  backdropImage,
  children,
}: {
  /** The mark inside the lit tile — a logo, a monogram, a brand glyph. */
  tile: ReactNode;
  /** Small tracked line above the title — the owner's name. */
  kicker?: string;
  title: string;
  subtitle: string;
  /** The quiet line under the card. */
  footer?: ReactNode;
  /** Optional photo under the overlay; absent, the layer paints nothing. */
  backdropImage?: string;
  children: ReactNode;
}) {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-primary px-6 py-12">
      {backdropImage && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backdropImage})` }}
        />
      )}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-primary/85" />

      {/* Depth without artwork: two washes, a darkening floor, and a halo that
          lifts the card off the stage. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-28 size-160 rounded-full bg-secondary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-44 -left-36 size-136 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/40 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 size-176 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl"
      />

      <PendantBulbs />

      <div className="relative flex w-full max-w-sm flex-col items-center">
        <div className="z-10 -mb-8 flex size-16 items-center justify-center rounded-2xl bg-white shadow-lg ring-4 ring-white/15">
          {tile}
        </div>

        <section className="w-full rounded-3xl bg-background px-6 pt-12 pb-8 shadow-2xl sm:px-8">
          <header className="flex flex-col items-center gap-1 text-center">
            {kicker && (
              <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                {kicker}
              </p>
            )}
            <h1 className="mt-2 text-[1.75rem] leading-[1.15] font-bold tracking-tight text-primary">
              {title}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
          </header>

          <div className="mt-8">{children}</div>
        </section>

        {footer && (
          <p className="mt-7 flex items-center gap-1.5 text-xs text-primary-foreground/50">
            {footer}
          </p>
        )}
      </div>
    </main>
  );
}

/**
 * Pendant filament bulbs hanging into the stage — line art, one lit with the
 * lemon secondary: prepaid power, on. Hidden below lg so phones keep a clean
 * stage.
 */
function PendantBulbs() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMin slice"
      className="pointer-events-none absolute inset-0 hidden size-full lg:block"
    >
      <defs>
        <radialGradient id="auth-stage-bulb-glow">
          <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity="0.4" />
          <stop offset="55%" stopColor="var(--color-secondary)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g stroke="white" strokeOpacity="0.22" strokeWidth="1.5" fill="none">
        <line x1="215" y1="0" x2="215" y2="180" />
        <rect x="207" y="180" width="16" height="22" rx="3" />
        <circle cx="215" cy="240" r="38" />
        <path d="M205 214 v14 m20 -14 v14 M205 228 q10 14 20 0" />
      </g>
      <g stroke="white" strokeOpacity="0.14" strokeWidth="1.5" fill="none">
        <line x1="330" y1="0" x2="330" y2="90" />
        <rect x="323" y="90" width="14" height="19" rx="3" />
        <circle cx="330" cy="141" r="32" />
        <path d="M322 119 v12 m16 -12 v12 M322 131 q8 12 16 0" />
      </g>

      <circle cx="1205" cy="305" r="170" fill="url(#auth-stage-bulb-glow)" />
      <g stroke="white" strokeOpacity="0.35" strokeWidth="1.5" fill="none">
        <line x1="1205" y1="0" x2="1205" y2="240" />
        <rect x="1196" y="240" width="18" height="24" rx="3" />
        <circle cx="1205" cy="305" r="42" />
      </g>
      <path
        d="M1194 276 v16 m22 -16 v16 M1194 292 q11 16 22 0"
        stroke="var(--color-secondary)"
        strokeOpacity="0.9"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}
