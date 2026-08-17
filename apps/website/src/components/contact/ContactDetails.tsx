import { Mail, MapPin, Phone, Store } from "lucide-react";

import CtaLink from "@/components/shared/CtaLink";
import { FadeIn, FadeInStagger } from "@/components/shared/FadeIn";
import { Heading, Plain } from "@/components/shared/Stage";

// Every channel here is live. The form this replaced sent nothing anywhere.
const SUBJECT = "Enquiry from gridcore.com";

interface Channel {
  icon: typeof Mail;
  label: string;
  lines: { text: string; href?: string }[];
}

const channels: Channel[] = [
  {
    icon: Mail,
    label: "Email",
    lines: [
      { text: "info@gridcoreinc.com", href: "mailto:info@gridcoreinc.com" },
    ],
  },
  {
    icon: Phone,
    label: "Phone",
    lines: [
      { text: "+234 802 776 2570", href: "tel:+2348027762570" },
      { text: "+234 903 071 8745", href: "tel:+2349030718745" },
    ],
  },
  {
    icon: MapPin,
    label: "Office",
    lines: [{ text: "41 Addo-Langbasa Road, Ajah, Lagos, Nigeria" }],
  },
];

const ContactDetails = () => {
  return (
    <Plain className="py-20 md:py-28">
      <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <Heading
            tone="light"
            kicker="How to reach us"
            title="Tell us about your energy infrastructure needs."
            lede="We reply within 24 hours. Every channel below reaches a person — there is no form standing between you and one."
          />

          <FadeIn className="mt-9 flex flex-wrap gap-4">
            <CtaLink
              href={`mailto:info@gridcoreinc.com?subject=${encodeURIComponent(SUBJECT)}`}
              variant="default"
            >
              Email us
            </CtaLink>
            <CtaLink href="/apply" variant="outline">
              Get started
            </CtaLink>
          </FadeIn>
        </div>

        <FadeInStagger className="flex flex-col gap-5">
          {channels.map(({ icon: Icon, label, lines }) => (
            <FadeIn
              key={label}
              className="flex gap-5 rounded-xl border border-border bg-card p-6"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary text-secondary">
                <Icon className="size-5" aria-hidden />
              </span>
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-primary/60">
                  {label}
                </h2>
                <div className="mt-2 flex flex-col gap-1">
                  {lines.map((line) =>
                    line.href ? (
                      <a
                        key={line.text}
                        href={line.href}
                        className="text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        {line.text}
                      </a>
                    ) : (
                      <p key={line.text} className="text-primary/75">
                        {line.text}
                      </p>
                    )
                  )}
                </div>
              </div>
            </FadeIn>
          ))}

          <FadeIn className="flex gap-5 rounded-xl bg-secondary/20 p-6">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary text-secondary">
              <Store className="size-5" aria-hidden />
            </span>
            <div>
              <h2 className="font-semibold text-primary">
                Applying to sell energy?
              </h2>
              <p className="mt-1.5 text-sm text-primary/75">
                You do not need to email us. The{" "}
                <a
                  href="/apply"
                  className="font-medium text-primary underline underline-offset-4"
                >
                  merchant application
                </a>{" "}
                takes about ten minutes and a person reviews every one.
              </p>
            </div>
          </FadeIn>
        </FadeInStagger>
      </div>
    </Plain>
  );
};

export default ContactDetails;
