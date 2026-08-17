import Providers from "@/components/shared/Providers";

import ApplyForm from "./ApplyForm";

// Providers are scoped to this island: it is the only part of a static
// marketing site that needs react-query.
export default function ApplySection() {
  return (
    <Providers>
      <section id="apply" className="bg-background pb-20 pt-32 sm:pb-28 sm:pt-40">
        {/* The pre-rename anchor; links in the wild still point at it. */}
        <span id="merchant-form" aria-hidden className="sr-only" />

        <div className="container">
          <div className="mb-12 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary/60">
              Become a merchant
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-primary sm:text-4xl">
              Apply in three steps.
            </h1>
            <p className="mt-4 text-primary/70">
              Tell us about the business, upload two documents, and confirm your phone. A person
              reviews every application — you will hear back by SMS either way.
            </p>
          </div>

          <ApplyForm />
        </div>
      </section>
    </Providers>
  );
}
