import CtaLink from "@/components/shared/CtaLink";
import { FadeIn } from "@/components/shared/FadeIn";

// One treatment. Colour is not a prop.
export default function CallToAction({
  title,
  body,
  label = "Get started",
  href = "/apply",
}: {
  title: string;
  body: string;
  label?: string;
  href?: string;
}) {
  return (
    <section className="container py-20 md:py-28">
      <FadeIn className="relative overflow-hidden rounded-2xl bg-primary px-8 py-14 text-center sm:px-14 sm:py-16">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-24 size-96 rounded-full bg-secondary/15 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 size-96 rounded-full bg-secondary/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-white/75">{body}</p>
          <CtaLink href={href} variant="secondary" className="mt-9">
            {label}
          </CtaLink>
        </div>
      </FadeIn>
    </section>
  );
}
