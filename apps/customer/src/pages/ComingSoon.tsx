import { useLocation } from "react-router-dom";

import { usePageTitle } from "@/hooks/usePageTitle";

const titles: Record<string, string> = {
  "/analytics": "Usage",
  "/my-meters": "My meters",
  "/payments": "Payments",
  "/profile": "Profile",
  "/topup": "Buy credit",
};

/**
 * The honest state of an unported screen (the cutover ruling in blueprint 32):
 * each returns for real when its customer read model exists, and until then the
 * portal says so instead of rendering a legacy screen against an API that is
 * gone.
 */
export default function ComingSoon() {
  const { pathname } = useLocation();
  usePageTitle(titles[pathname] ?? "Portal");

  return (
    <div className="flex flex-col items-start gap-2 px-8 py-16">
      <h1 className="text-2xl font-bold tracking-tight text-primary">
        {titles[pathname] ?? "This page"}
      </h1>
      <p className="text-sm text-muted-foreground">
        This part of the portal is being rebuilt and will be back shortly.
      </p>
    </div>
  );
}
