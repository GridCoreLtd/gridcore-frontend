import * as React from "react";

import { cn } from "../lib/utils";
import { Button as ShadcnButton, type ButtonProps } from "./ui/button";

type Variant = NonNullable<ButtonProps["variant"]>;
type Size = NonNullable<ButtonProps["size"]>;

interface AppButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  text: string;
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  /** Kept for the call sites that predate `disabled`. */
  isDisabled?: boolean;
  type?: "button" | "submit" | "reset";
  prefixIcon?: React.ReactElement;
  suffixIcon?: React.ReactElement;
  /** Layout only. Colours come from `variant` — see conventions §5. */
  width?: string;
  height?: string;
}

/**
 * The button the apps actually call: label as a prop, a loading state, and
 * optional icons.
 *
 * It exists on top of the shadcn `Button` rather than replacing it because ~70
 * call sites already pass `text` and `isLoading`. What it deliberately does not
 * take is `bgColor`/`textColor` — colour is a `variant`, so a new brand is one
 * edit here instead of a search for hex literals.
 */
const Button = React.forwardRef<HTMLButtonElement, AppButtonProps>(
  (
    {
      text,
      variant = "default",
      size = "default",
      isLoading = false,
      isDisabled = false,
      disabled,
      type = "button",
      prefixIcon,
      suffixIcon,
      width,
      height,
      className,
      style,
      ...rest
    },
    ref
  ) => (
    <ShadcnButton
      ref={ref}
      type={type}
      variant={variant}
      size={size}
      disabled={disabled || isDisabled || isLoading}
      style={{ width, height, ...style }}
      className={cn("shadow-xs", className)}
      {...rest}
    >
      {isLoading ? (
        <>
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {prefixIcon}
          <span>{text}</span>
          {suffixIcon}
        </>
      )}
    </ShadcnButton>
  )
);
Button.displayName = "Button";

export default Button;
export type { AppButtonProps };
