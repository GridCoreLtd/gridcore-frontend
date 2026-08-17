import { Landmark, Plug, Receipt } from "lucide-react";

import { FadeIn, FadeInStagger } from "@/components/shared/FadeIn";
import { Heading, Stage } from "@/components/shared/Stage";

// The operating cycle as a merchant experiences it — the pitch above says why,
// this says how the whole system actually runs.
const steps = [
  {
    step: "01",
    title: "Onboard your customers",
    body: "Add customers and assign each one a meter. They are told the moment a meter becomes theirs.",
  },
  {
    step: "02",
    title: "They pay their own way",
    body: "Card, a bank transfer to their meter’s own account number, or a voucher — whichever suits them.",
  },
  {
    step: "03",
    title: "The token issues itself",
    body: "The payment becomes energy units at that meter’s tariff, and a 20-digit STS token they key in.",
  },
  {
    step: "04",
    title: "You are paid on your schedule",
    body: "Your balance is held in your wallet, less commission, and settles to your bank daily, weekly or monthly.",
  },
];

// Deliberately not a restatement of the three cards above — these are the parts
// of the system that section does not mention.
const facts = [
  {
    icon: Landmark,
    title: "Every meter has its own account number",
    body: "A customer tops up by bank transfer and the meter vends itself. You are not in the middle of it.",
  },
  {
    icon: Receipt,
    title: "Charges you set, recovered automatically",
    body: "Apply a maintenance or service charge across a site and it comes off the next purchase.",
  },
  {
    icon: Plug,
    title: "Or skip the console entirely",
    body: "Prefer to vend from your own system? There is a signed API for that, with the same records behind it.",
  },
];

const MerchantHowItWorks = () => (
  <Stage className="py-20 md:py-28">
    <Heading
      kicker="The operating cycle"
      title="How selling works, end to end."
      lede="You look after your customers and your grid. GridCore handles the money, the meters and the tokens in between."
    />

    <FadeInStagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map(({ step, title, body }) => (
        <FadeIn
          key={step}
          className="rounded-xl border border-white/10 bg-white/3 p-6 transition hover:border-secondary/40"
        >
          <p className="text-2xl font-semibold text-secondary">{step}</p>
          <h3 className="mt-4 font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm text-white/70">{body}</p>
        </FadeIn>
      ))}
    </FadeInStagger>

    <FadeInStagger className="mt-14 grid gap-8 border-t border-white/10 pt-10 md:grid-cols-3">
      {facts.map(({ icon: Icon, title, body }) => (
        <FadeIn key={title} className="flex gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary/15 text-secondary">
            <Icon className="size-5" aria-hidden />
          </span>
          <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="mt-1 text-sm text-white/70">{body}</p>
          </div>
        </FadeIn>
      ))}
    </FadeInStagger>
  </Stage>
);

export default MerchantHowItWorks;
