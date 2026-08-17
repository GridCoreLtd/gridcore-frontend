import { useEffect } from "react";

import { portalSlug } from "@/utils/portal";

/**
 * The browser tab reads "page — portal", so a customer with three merchant
 * tabs open can tell them apart. The slug is the merchant's short business
 * name — it IS the hostname's label, so it needs no fetch.
 */
export function usePageTitle(page: string) {
  useEffect(() => {
    document.title = `${page} — ${portalSlug()}`;
  }, [page]);
}
