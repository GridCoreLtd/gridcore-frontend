import {
  Cpu,
  GaugeCircle,
  GraduationCap,
  Lock,
  Network,
  ShieldAlert,
  Sun,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import CtaLink from "@/components/shared/CtaLink";
import { FadeIn, FadeInStagger } from "@/components/shared/FadeIn";
import { Heading, Plain } from "@/components/shared/Stage";

// One block used twice; the image side is a prop, so alternating is a decision.
interface Feature {
  icon: LucideIcon;
  label: string;
}

function Block({
  kicker,
  title,
  lede,
  body,
  image,
  imageAlt,
  imageSide,
  featuresTitle,
  features,
  children,
}: {
  kicker: string;
  title: string;
  lede: string;
  body: string;
  image: string;
  imageAlt: string;
  imageSide: "left" | "right";
  featuresTitle: string;
  features: Feature[];
  children: React.ReactNode;
}) {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
      <FadeIn
        className={
          imageSide === "right" ? "lg:order-2" : "lg:order-1"
        }
      >
        <img
          src={image}
          alt={imageAlt}
          loading="lazy"
          decoding="async"
          className="w-full rounded-xl border border-border bg-card object-cover"
        />
      </FadeIn>

      <div className={imageSide === "right" ? "lg:order-1" : "lg:order-2"}>
        <Heading tone="light" kicker={kicker} title={title} />
        <p className="mt-3 text-sm font-medium uppercase tracking-wide text-primary/50">
          {lede}
        </p>
        <p className="mt-4 text-primary/70">{body}</p>

        <h3 className="mt-10 text-sm font-semibold uppercase tracking-widest text-primary/60">
          {featuresTitle}
        </h3>
        <FadeInStagger className="mt-5 flex flex-col gap-3.5">
          {features.map(({ icon: Icon, label }) => (
            <FadeIn key={label} className="flex items-start gap-3.5">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary/25 text-primary">
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="text-primary/80">{label}</span>
            </FadeIn>
          ))}
        </FadeInStagger>

        <div className="mt-10 flex flex-wrap gap-4">{children}</div>
      </div>
    </div>
  );
}

const SolutionsGridMeter = () => {
  return (
    <Plain className="flex flex-col gap-24 py-20 md:gap-32 md:py-28">
      <Block
        kicker="GridMeter"
        title="Metering intelligence, end to end."
        lede="Smart. Secure. Connected."
        body="Accurate energy tracking, integrated billing and wallet-based payments, designed for off-grid, mini-grid and C&I applications."
        image="/images/grid-meter.webp"
        imageAlt="The GridMeter smart meter unit"
        imageSide="left"
        featuresTitle="Key features"
        features={[
          { icon: ShieldAlert, label: "Real-time monitoring and tamper alerts" },
          { icon: Wallet, label: "Integrated mobile money and wallet APIs" },
          { icon: Lock, label: "Data encryption and secure cloud sync" },
          {
            icon: Network,
            label: "Plug-and-play for mesh grids and distributed systems",
          },
        ]}
      >
        <CtaLink href="/apply" variant="secondary">
          Get started
        </CtaLink>
        <CtaLink href="/contact-us" variant="outline">
          Schedule a demo
        </CtaLink>
      </Block>

      <Block
        kicker="GridAcademy"
        title="Building Africa’s energy workforce."
        lede="The heartbeat of our capacity development mission."
        body="Training local talent in installation, operation and digital energy management — so the people maintaining the grid are the people who live on it."
        image="/images/grid-academy.webp"
        imageAlt="Trainees at a GridAcademy session"
        imageSide="right"
        featuresTitle="Programmes include"
        features={[
          { icon: Sun, label: "Solar and smart meter installation" },
          { icon: Cpu, label: "Edge device configuration" },
          { icon: GaugeCircle, label: "Energy analytics and data management" },
          { icon: GraduationCap, label: "Community agent certification" },
        ]}
      >
        <CtaLink href="/contact-us" variant="secondary">
          Join GridAcademy
        </CtaLink>
      </Block>
    </Plain>
  );
};

export default SolutionsGridMeter;
