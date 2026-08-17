import { Check } from "lucide-react";

/**
 * The old form ended on a modal saying "Registration successful!". The thing an
 * applicant actually wants at that moment is what happens next and roughly when
 * — so this is a state, not a dialog, and it names the three stages the flow
 * really has (blueprint 34's approve → claim → sign-in).
 */
export function Submitted({
  businessName,
  portalHost,
  phone,
}: {
  businessName: string;
  portalHost: string;
  phone: string;
}) {
  const stages = [
    {
      title: "We review your application",
      body: "A person checks your CAC certificate and ID against the business details you gave.",
    },
    {
      title: "You get a text",
      body: `Either way, we tell you at ${phone}. If you are approved it carries a link to set your password — it works once.`,
    },
    {
      title: `${portalHost} goes live`,
      body: "Your customers sign in there, with your logo on it. You manage meters, customers and payouts from the GridCore console.",
    },
  ];

  return (
    <div className="mx-auto max-w-xl text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
        <Check className="size-7" aria-hidden />
      </span>

      <h2 className="mt-6 text-2xl font-semibold text-primary sm:text-3xl">
        {businessName} has applied
      </h2>
      <p className="mt-3 text-sm text-primary/70">
        Nothing else is needed from you right now. Here is what happens next.
      </p>

      <ol className="mt-10 flex flex-col gap-px overflow-hidden rounded-2xl border border-border bg-border text-left">
        {stages.map((stage, index) => (
          <li key={stage.title} className="flex gap-4 bg-card p-5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
              {index + 1}
            </span>
            <span>
              <span className="block text-sm font-semibold text-primary">{stage.title}</span>
              <span className="mt-1 block text-xs leading-relaxed text-primary/70">{stage.body}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
