import type { ReactNode } from "react";

import AuthStage from "@gridcore/ui/components/AuthStage";
import BrandMark from "@gridcore/ui/components/BrandMark";

/**
 * The console's skin on the shared midnight stage — modelled on the customer
 * portal's login at the user's request (blueprint 32 §11.3). Here the identity
 * is GridCore's own: the brand bolt in the tile, the wordmark as the kicker,
 * the brand line as the footline.
 */
export default function AuthShell({
  title,
  subtitle,
  headerSlot,
  children,
}: {
  title: string;
  subtitle: string;
  /** A small counterpart line — rendered under the form, centred. */
  headerSlot?: ReactNode;
  children: ReactNode;
}) {
  return (
    <AuthStage
      kicker="GridCore"
      title={title}
      subtitle={subtitle}
      footer="Powering Africa’s energy."
      tile={<BrandMark />}
    >
      {children}
      {headerSlot && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          {headerSlot}
        </div>
      )}
    </AuthStage>
  );
}
