import { Banknote, LineChart, Users } from "lucide-react";

import { FadeIn, FadeInStagger } from "@/components/shared/FadeIn";
import { Heading, Plain } from "@/components/shared/Stage";

// The pitch, immediately above the application form.
const offer = [
  {
    icon: Users,
    title: "Your own branded portal",
    body: "Your customers sign in at your own address, under your logo. GridCore is the engine, not the brand they see.",
  },
  {
    icon: Banknote,
    title: "Money that reconciles",
    body: "Every payment and every token is a double-entry record, and your balance settles to your bank on the schedule you choose.",
  },
  {
    icon: LineChart,
    title: "Meters you can see",
    body: "Smart meters polled automatically, with the latest reading, tamper alerts and remote control from one console.",
  },
];

const MerchantOurKey = () => {
  return (
    <Plain className="py-20 md:py-28">
      <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <Heading
            tone="light"
            kicker="Why sell with us"
            title="Merchants are our key to energy access for all."
            lede="We believe sustainable, affordable energy should be accessible to everyone. That is why we have built a network of merchants who share that commitment — and given them the tools to deliver on it."
          />
        </div>

        <FadeInStagger className="flex flex-col gap-5">
          {offer.map(({ icon: Icon, title, body }) => (
            <FadeIn
              key={title}
              className="flex gap-5 rounded-xl border border-border bg-card p-6"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary text-secondary">
                <Icon className="size-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-semibold text-primary">{title}</h3>
                <p className="mt-1.5 text-sm text-primary/70">{body}</p>
              </div>
            </FadeIn>
          ))}
        </FadeInStagger>
      </div>
    </Plain>
  );
};

export default MerchantOurKey;
