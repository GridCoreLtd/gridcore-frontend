import { useQuery } from "@tanstack/react-query";

import { portalSlug } from "@/utils/portal";

import { getPortalBranding } from "./api";

export function useBranding() {
  const slug = portalSlug();
  const { data, isLoading } = useQuery({
    queryKey: ["portal-branding", slug],
    queryFn: () => getPortalBranding(slug),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  return { branding: data, isLoading };
}
