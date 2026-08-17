import * as React from "react";

import { cn } from "../lib/utils";

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  endSlot?: React.ReactNode;
  containerClassName?: string;
}


const Field = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, endSlot, containerClassName, className, id, ...rest }, ref) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    const errorId = `${inputId}-error`;

    return (
      <div className={cn("group", containerClassName)}>
        {/* `relative` anchors both the notch and the end slot. */}
        <div className="relative">
          <label
            htmlFor={inputId}
            className={cn(
              // Sits on the border line, with a background chip masking the
              // border behind it — that gap is the notch.
              "absolute -top-2 left-3 z-10 bg-background px-1.5 text-xs font-medium",
              "text-muted-foreground transition-colors",
              "group-focus-within:text-primary",
              error && "text-destructive"
            )}
          >
            {label}
          </label>

          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              "block w-full rounded-md border bg-transparent px-3.5 py-3.5",
              "text-base leading-6 md:text-sm",
              "border-input placeholder:text-xs placeholder:text-muted-foreground/70",
              "hover:border-muted-foreground/40",
              // One pixel of border becomes two of brand navy, so focus reads as
              // a state rather than as an edge.
              "focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none",
              "disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground",
              error && "border-destructive focus:border-destructive focus:ring-destructive",
              endSlot && "pr-11",
              className
            )}
            {...rest}
          />

          {endSlot && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-2.5">
              {endSlot}
            </div>
          )}
        </div>

        {error && (
          <p id={errorId} className="mt-1.5 text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Field.displayName = "Field";

export default Field;
