import { useEffect, useRef, useState } from "react";

import { FileText, ImageIcon, Upload, X } from "lucide-react";

const readableSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

/**
 * One file, shown as the thing it is rather than as an input.
 *
 * `preview` is for the logo only, and deliberately: the logo is public branding
 * the merchant will meet again on their own portal (D-059), so seeing it here is
 * the point. A government ID is private evidence — rendering it large on
 * whatever screen someone is filling this in on is a hazard, not a feature, so
 * documents show as a card with a name and a size.
 */
export function FilePicker({
  id,
  label,
  hint,
  accept,
  maxMB,
  preview = false,
  value,
  error,
  onPick,
}: {
  id: string;
  label: string;
  hint: string;
  accept: string;
  maxMB: number;
  preview?: boolean;
  value?: File;
  error?: string;
  onPick: (file?: File) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [objectURL, setObjectURL] = useState<string>();
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!preview || !value?.type.startsWith("image/")) {
      setObjectURL(undefined);
      return;
    }
    const url = URL.createObjectURL(value);
    setObjectURL(url);
    // Revoked on replace as well as unmount, or picking six logos leaks five.
    return () => URL.revokeObjectURL(url);
  }, [preview, value]);

  const clear = () => {
    onPick(undefined);
    if (input.current) input.current.value = "";
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-primary">{label}</span>
      <p className="text-xs text-primary/65">{hint}</p>

      <input
        ref={input}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onPick(event.target.files?.[0])}
      />

      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-input bg-background p-3">
          {objectURL ? (
            <img
              src={objectURL}
              alt=""
              className="size-12 shrink-0 rounded-md bg-muted object-contain p-1"
            />
          ) : (
            <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-secondary/35 text-primary">
              {value.type.startsWith("image/") ? (
                <ImageIcon className="size-5" aria-hidden />
              ) : (
                <FileText className="size-5" aria-hidden />
              )}
            </span>
          )}

          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm text-primary">{value.name}</span>
            <span className="text-xs text-primary/65">{readableSize(value.size)}</span>
          </span>

          <button
            type="button"
            onClick={() => input.current?.click()}
            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-background"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={clear}
            aria-label={`Remove ${value.name}`}
            className="rounded-md p-1.5 text-primary/60 hover:bg-background hover:text-primary"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            onPick(event.dataTransfer.files?.[0]);
          }}
          className={`flex w-full items-center gap-3 rounded-lg border border-dashed p-4 text-left transition ${
            dragging
              ? "border-secondary bg-secondary/10"
              : error
                ? "border-destructive bg-background"
                : "border-input bg-background hover:border-primary/40"
          }`}
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-primary/70">
            <Upload className="size-4" aria-hidden />
          </span>
          <span className="text-sm text-primary/75">
            <span className="font-medium text-primary">Choose a file</span> or drag it here
            <span className="block text-xs text-primary/55">
              {accept.replace(/image\/|application\//g, "").toUpperCase().replace(/,/g, " · ")} ·
              up to {maxMB}MB
            </span>
          </span>
        </button>
      )}

      <p id={`${id}-error`} role={error ? "alert" : undefined} className="min-h-4 text-xs text-destructive">
        {error}
      </p>
    </div>
  );
}
