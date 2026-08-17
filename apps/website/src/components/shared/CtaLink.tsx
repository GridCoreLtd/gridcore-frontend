import type { AnchorHTMLAttributes } from "react";

import { buttonVariants } from "@gridcore/ui/components/ui/button";
import type { ButtonProps } from "@gridcore/ui/components/ui/button";

// Every call to action navigates, so it is an anchor, not a button in a link.
export default function CtaLink({
  variant = "secondary",
  size = "xl",
  className,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}) {
  return (
    <a {...props} className={buttonVariants({ variant, size, className })}>
      {children}
    </a>
  );
}
