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

          {/* Base + focus classes mirror ui/input.tsx exactly — the registry
              Input takes no ref (React 18), so the notch keeps its own element.
              A change there is a change here. */}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              "h-[3.25rem] w-full min-w-0 rounded-md border border-input bg-transparent px-3.5 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm dark:bg-input/30",
              "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
              "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
              "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
              // The house's own: quieter placeholders under a notched label.
              "placeholder:text-xs placeholder:text-muted-foreground/70",
              endSlot && "pr-10",
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
