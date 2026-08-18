import { forwardRef } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

// Label above, hint under the label, message under the control. `Field`'s
// notched label has no room for a hint or an optional marker; this does.
function Shell({
  id,
  label,
  hint,
  error,
  optional,
  children,
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-primary">{label}</span>
        {optional && <span className="text-xs text-primary/55">Optional</span>}
      </label>
      {hint && <p className="text-xs text-primary/65">{hint}</p>}
      {children}
      {/* Always rendered, so a field never changes height when it goes invalid. */}
      <p
        id={`${id}-error`}
        role={error ? "alert" : undefined}
        className="min-h-4 text-xs text-destructive"
      >
        {error}
      </p>
    </div>
  );
}

const control =
  "w-full rounded-lg border bg-background px-3.5 text-sm text-primary " +
  "placeholder:text-primary/40 outline-none transition " +
  "focus:border-primary focus:ring-2 focus:ring-primary/20";

// The house field height — matches Button size=xl, single-line controls only.
const fieldHeight = "h-[3.25rem]";

const edge = (error?: string) =>
  error ? "border-destructive" : "border-input hover:border-primary/40";

export const TextField = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    hint?: ReactNode;
    error?: string;
    optional?: boolean;
  }
>(function TextField({ label, hint, error, optional, id, ...props }, ref) {
  const fieldId = id ?? props.name ?? label;

  return (
    <Shell id={fieldId} label={label} hint={hint} error={error} optional={optional}>
      <input
        {...props}
        ref={ref}
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={`${control} ${fieldHeight} ${edge(error)}`}
      />
    </Shell>
  );
});

export const TextArea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label: string;
    hint?: ReactNode;
    error?: string;
    optional?: boolean;
  }
>(function TextArea({ label, hint, error, optional, id, ...props }, ref) {
  const fieldId = id ?? props.name ?? label;

  return (
    <Shell id={fieldId} label={label} hint={hint} error={error} optional={optional}>
      <textarea
        {...props}
        ref={ref}
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={`${control} py-2.5 resize-y ${edge(error)}`}
      />
    </Shell>
  );
});

export const SelectField = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & {
    label: string;
    hint?: ReactNode;
    error?: string;
  }
>(function SelectField({ label, hint, error, id, children, ...props }, ref) {
  const fieldId = id ?? props.name ?? label;

  return (
    <Shell id={fieldId} label={label} hint={hint} error={error}>
      {/* Native select — on a phone it opens the OS picker. */}
      <select
        {...props}
        ref={ref}
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={`${control} ${fieldHeight} appearance-none ${edge(error)}`}
      >
        {children}
      </select>
    </Shell>
  );
});
