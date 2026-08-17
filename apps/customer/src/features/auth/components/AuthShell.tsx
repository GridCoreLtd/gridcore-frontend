import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";

import AuthStage from "@gridcore/ui/components/AuthStage";
import BrandMark from "@gridcore/ui/components/BrandMark";

import type { PortalBranding } from "../types";

/**
 * The portal's skin on the shared midnight stage (blueprint 32 §11): this is
 * the merchant's storefront, so their mark and name are the identity and
 * GridCore is the quiet line at the foot.
 */
export default function AuthShell({
  branding,
  title,
  subtitle,
  children,
}: {
  branding?: PortalBranding;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <AuthStage
      backdropImage="/images/auth-backdrop.jpg"
      kicker={branding?.name}
      title={title}
      subtitle={subtitle}
      footer={
        <>
          <ShieldCheck className="size-3.5" aria-hidden />
          Secured by GridCore
        </>
      }
      tile={<BrandMark src={branding?.logoUrl} name={branding?.name} />}
    >
      {children}
    </AuthStage>
  );
}
