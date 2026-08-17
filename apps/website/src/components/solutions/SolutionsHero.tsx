import CtaLink from "@/components/shared/CtaLink";
import PageHero from "@/components/shared/PageHero";

const SolutionsHero = () => (
  <PageHero
    kicker="Solutions"
    title="Discover the GridCore ecosystem"
    lede="A suite of intelligent modules powering Africa’s decentralised energy revolution — one grid, one connection, one community at a time."
  >
    <CtaLink href="/apply" variant="secondary">
      Get started
    </CtaLink>
    <CtaLink href="/contact-us" variant="stageOutline">
      Talk to us
    </CtaLink>
  </PageHero>
);

export default SolutionsHero;
