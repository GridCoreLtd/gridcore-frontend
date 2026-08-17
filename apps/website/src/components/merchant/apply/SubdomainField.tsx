import { forwardRef } from "react";

import { MAX_SUBDOMAIN } from "./schema";

/**
 * The most consequential field on the form, and the one the old version
 * explained least.
 *
 * What is typed here becomes the merchant's permanent portal address (D-020) —
 * the URL their own customers sign in at. Showing that address as they type is
 * the whole point: the rule (a DNS label) stops being arbitrary the moment you
 * can see it is a hostname.
 */
export const SubdomainField = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    error?: string;
    /** What has been typed so far, for the preview. */
    value?: string;
    portalDomain: string;
  }
>(function SubdomainField({ error, value, portalDomain, id = "shortBusinessName", ...props }, ref) {
  const typed = (value ?? "").trim().toLowerCase();

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-primary">
        Your portal address
      </label>
      <p className="text-xs text-primary/65">
        Your customers will sign in here. It cannot be changed later.
      </p>

      <div
        className={`flex items-stretch overflow-hidden rounded-lg border bg-background transition focus-within:ring-2 focus-within:ring-primary/20 ${
          error ? "border-destructive" : "border-input focus-within:border-primary"
        }`}
      >
        <input
          {...props}
          ref={ref}
          id={id}
          value={value}
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          maxLength={MAX_SUBDOMAIN}
          placeholder="your-business"
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-preview ${error ? `${id}-error` : ""}`.trim()}
          className="min-w-0 flex-1 bg-transparent px-3.5 py-2.5 text-sm text-primary outline-none placeholder:text-primary/40"
        />
        <span
          aria-hidden
          className="flex items-center border-l border-border bg-background px-3 text-sm text-primary/60"
        >
          .{portalDomain}
        </span>
      </div>

      <p id={`${id}-preview`} className="text-xs text-primary/70">
        {typed ? (
          <>
            Your portal:{" "}
            <span className="font-medium text-primary">
              {typed}.{portalDomain}
            </span>
          </>
        ) : (
          <>Letters, digits and hyphens — up to {MAX_SUBDOMAIN} characters.</>
        )}
      </p>

      <p id={`${id}-error`} role={error ? "alert" : undefined} className="min-h-4 text-xs text-destructive">
        {error}
      </p>
    </div>
  );
});
