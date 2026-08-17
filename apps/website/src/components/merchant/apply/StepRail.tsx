import { Check, Lock } from "lucide-react";

export const STEPS = [
  { title: "Your business", blurb: "Who you are and where customers will find you" },
  { title: "Your documents", blurb: "Your logo, and the two we verify you with" },
  { title: "You", blurb: "The person who will administer the account" },
] as const;

/**
 * The rail explains rather than counts.
 *
 * The old indicator was three numbered circles. What a first-time applicant
 * actually needs to know is what is coming, that no password is set here, and
 * what happens after they press the button — so that is what occupies the space.
 */
export function StepRail({
  current,
  furthest,
  onJump,
}: {
  current: number;
  furthest: number;
  onJump: (step: number) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      <ol className="flex flex-col gap-1">
        {STEPS.map((step, index) => {
          const done = index < furthest;
          const active = index === current;
          const reachable = index <= furthest;

          return (
            <li key={step.title}>
              <button
                type="button"
                disabled={!reachable}
                onClick={() => onJump(index)}
                aria-current={active ? "step" : undefined}
                className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition ${
                  active ? "bg-primary" : reachable ? "hover:bg-muted" : "opacity-55"
                }`}
              >
                <span
                  className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                    active
                      ? "bg-secondary text-secondary-foreground"
                      : done
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-primary/65"
                  }`}
                >
                  {done ? <Check className="size-3.5" aria-hidden /> : index + 1}
                </span>
                <span>
                  <span
                    className={`block text-sm font-semibold ${active ? "text-primary-foreground" : "text-primary/85"}`}
                  >
                    {step.title}
                  </span>
                  <span
                    className={`block text-xs ${active ? "text-primary-foreground/75" : "text-primary/60"}`}
                  >
                    {step.blurb}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="rounded-xl border border-border bg-secondary/15 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Lock className="size-3.5 text-primary/70" aria-hidden />
          What happens to this
        </p>
        <ul className="mt-3 flex flex-col gap-2.5 text-xs leading-relaxed text-primary/70">
          <li>
            <span className="font-medium text-primary">You set no password here.</span> An application is not
            an account — we create one only once you are approved, and text you a link to set it.
          </li>
          <li>
            <span className="font-medium text-primary">Your CAC and ID stay private.</span> They are scanned
            and stored where only a reviewer can open them. Your logo is the exception: it becomes
            the branding on your own portal.
          </li>
          <li>
            <span className="font-medium text-primary">A person reviews it.</span> You will hear back by SMS
            whichever way it goes.
          </li>
        </ul>
      </div>
    </div>
  );
}
