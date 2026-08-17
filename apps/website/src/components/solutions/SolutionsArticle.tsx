import ModuleGrid from "@/components/shared/ModuleGrid";
import { Heading, Plain } from "@/components/shared/Stage";
import { modules } from "@/utils/modules";

// Same grid and same source as the home page's ecosystem section.
const SolutionsArticle = () => (
  <Plain className="py-20 md:py-28">
    <Heading
      tone="light"
      kicker="The modules"
      title="Six parts, built to work together."
    />
    <div className="mt-12">
      <ModuleGrid modules={modules} />
    </div>
  </Plain>
);

export default SolutionsArticle;
