import type { FC } from "react";

import PageHero from "@/components/shared/PageHero";

interface PPAndTACHeroProps {
  title: string;
}

const PPAndTACHero: FC<PPAndTACHeroProps> = ({ title }) => (
  <PageHero kicker="Effective January 2026" title={title} />
);

export default PPAndTACHero;
