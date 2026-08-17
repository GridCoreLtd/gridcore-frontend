import { useState } from "react";

import { Zap } from "lucide-react";

import { cn } from "../lib/utils";

/**
 * A merchant's mark, degrading twice: logo, then a monogram of their initial,
 * then a bolt. White-label means the URL is arbitrary, absent or broken, and a
 * broken image is never an acceptable render of someone's brand.
 */
export default function BrandMark({
  src,
  name,
  className,
}: {
  src?: string;
  name?: string;
  /** Size and radius belong to the call site; the tile and the header differ. */
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const initial = name?.trim().charAt(0).toUpperCase() ?? "";

  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        onError={() => setFailed(true)}
        className={cn("size-11 rounded-xl object-contain", className)}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "flex size-11 items-center justify-center rounded-xl bg-secondary text-xl font-bold text-secondary-foreground",
        className
      )}
    >
      {initial || <Zap className="size-1/2" />}
    </span>
  );
}
