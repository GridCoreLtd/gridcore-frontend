import { useEffect, useRef } from "react";

const LENGTH = 6;

/**
 * Six boxes over one value.
 *
 * The copy is deliberate: this does not verify anything. The server checks the
 * code when the application is submitted, so telling someone their phone is
 * "verified" here would be a claim the API never made — which is exactly what
 * the legacy form did.
 */
export function CodeField({
  value,
  onChange,
  error,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(LENGTH).slice(0, LENGTH).split("");

  useEffect(() => {
    if (!disabled) boxes.current[Math.min(value.length, LENGTH - 1)]?.focus();
    // Only on mount and when it unlocks — moving focus on every keystroke would
    // fight the caret.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  const set = (index: number, digit: string) => {
    const next = digits.map((d, i) => (i === index ? digit : d)).join("").trimEnd();
    onChange(next.replace(/\s/g, ""));
    if (digit && index < LENGTH - 1) boxes.current[index + 1]?.focus();
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-primary">Confirmation code</span>
      <p className="text-xs text-primary/65">
        We sent six digits by SMS. We check it when you send the application.
      </p>

      <div className="flex gap-2" role="group" aria-label="Confirmation code">
        {Array.from({ length: LENGTH }, (_, index) => (
          <input
            key={index}
            ref={(node) => {
              boxes.current[index] = node;
            }}
            value={digits[index]?.trim() ?? ""}
            disabled={disabled}
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            aria-label={`Digit ${index + 1}`}
            aria-invalid={Boolean(error)}
            maxLength={1}
            onChange={(event) => set(index, event.target.value.replace(/\D/g, "").slice(-1))}
            onKeyDown={(event) => {
              if (event.key === "Backspace" && !digits[index]?.trim() && index > 0) {
                boxes.current[index - 1]?.focus();
              }
            }}
            onPaste={(event) => {
              // One paste fills the row; pasting into box 3 should not scatter.
              event.preventDefault();
              onChange(event.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH));
            }}
            className={`size-11 rounded-lg border bg-background text-center text-lg font-semibold text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-40 ${
              error ? "border-destructive" : "border-input"
            }`}
          />
        ))}
      </div>

      <p role={error ? "alert" : undefined} className="min-h-4 text-xs text-destructive">
        {error}
      </p>
    </div>
  );
}
