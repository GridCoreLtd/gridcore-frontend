import { useEffect, useRef, useState } from "react";

import { Loader2 } from "lucide-react";

/**
 * A PDF drawn to canvases by PDF.js rather than handed to the browser.
 *
 * The built-in viewer is a scripted component, so it does not run inside a
 * sandboxed frame at all — Edge renders nothing — and letting it run unsandboxed
 * is the attack blueprint 15 §6 exists to stop. Rasterising here needs neither:
 * this build has no scripting engine to enable, so a document's own JavaScript
 * cannot run, and what reaches the reviewer is pixels.
 */
export default function PdfPages({ data, label }: { data: ArrayBuffer; label: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<number>();
  const [failed, setFailed] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    void (async () => {
      try {
        const [pdfjs, worker] = await Promise.all([
          import("pdfjs-dist"),
          // `?url`, not `new URL(...)`: Vite only rewrites relative paths there,
          // so a bare specifier would resolve at runtime and 404 in the build.
          import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
        ]);
        pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

        // getDocument transfers the buffer, so a re-render would see it detached.
        const task = pdfjs.getDocument({ data: data.slice(0) });
        cleanup = () => void task.destroy();

        const doc = await task.promise;
        if (cancelled) return;
        setPages(doc.numPages);

        for (let n = 1; n <= doc.numPages; n++) {
          const page = await doc.getPage(n);
          if (cancelled) return;

          // Twice the CSS size, so the small print on a scanned ID stays legible.
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.className = "w-full bg-white shadow-sm";

          host.current?.append(canvas);
          await page.render({ canvas, viewport }).promise;
        }
      } catch (err) {
        if (!cancelled) setFailed(err instanceof Error ? err.message : "Unreadable file");
      }
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [data]);

  if (failed) {
    return (
      <p className="p-8 text-center text-sm text-muted-foreground">
        This file could not be read as a PDF. {failed}
      </p>
    );
  }

  return (
    <div className="flex h-140 w-full flex-col gap-3 overflow-y-auto p-3">
      {pages === undefined && (
        <div className="grid flex-1 place-items-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
        </div>
      )}
      <div ref={host} className="flex flex-col gap-3" aria-label={label} />
    </div>
  );
}
