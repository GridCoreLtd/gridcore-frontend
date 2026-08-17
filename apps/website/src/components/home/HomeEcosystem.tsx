import { ArrowRight } from "lucide-react";

import { FadeIn } from "@/components/shared/FadeIn";
import ModuleGrid from "@/components/shared/ModuleGrid";
import { Heading, Plain } from "@/components/shared/Stage";
import { modules } from "@/utils/modules";

const HomeEcosystem = () => (
  <Plain className="py-20 md:py-28">
    <Heading
      tone="light"
      kicker="The GridCore ecosystem"
      title="Six modules, one system."
      lede="Proprietary hardware, edge devices and software orchestration, built to work together — so a merchant adopts a platform rather than assembling one."
    />

    <div className="mt-12">
      <ModuleGrid modules={modules} />
    </div>

    <FadeIn className="mt-12">
      <a
        href="/solutions"
        className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-primary transition hover:gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        See what each one does
        <ArrowRight className="size-4" aria-hidden />
      </a>
    </FadeIn>
  </Plain>
);

export default HomeEcosystem;
