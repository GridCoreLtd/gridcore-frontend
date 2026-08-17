import { useEffect, useState } from "react";

import { Loader2, ShieldAlert } from "lucide-react";

import { parseApiError, type ApiProblem } from "@gridcore/api-client";
import Modal from "@gridcore/ui/components/overlays/Modal";

import { fetchApplicationDocument } from "../api";
import type { DocumentType } from "../types";

import PdfPages from "./PdfPages";

type Loaded = { contentType: string; imageUrl?: string; pdf?: ArrayBuffer };

/**
 * Evidence about a person, shown and not saved. The bytes live in memory for as
 * long as the dialog is open; an image's object URL is revoked on close.
 *
 * Nothing here hands the file to the browser to open — an image is drawn as an
 * image and a PDF is rasterised by PDF.js, so no document ever executes.
 */
export default function DocumentViewer({
  applicationID,
  type,
  title,
  onClose,
}: {
  applicationID: string;
  type: DocumentType;
  title: string;
  onClose: () => void;
}) {
  const [doc, setDoc] = useState<Loaded>();
  const [error, setError] = useState<ApiProblem>();

  useEffect(() => {
    let cancelled = false;
    let url: string | undefined;

    void (async () => {
      try {
        const { contentType, blob } = await fetchApplicationDocument(applicationID, type);

        if (contentType.startsWith("image/")) {
          url = URL.createObjectURL(blob);
          // Closing before the bytes land would otherwise strand the URL.
          if (cancelled) return URL.revokeObjectURL(url);
          return setDoc({ contentType, imageUrl: url });
        }

        const pdf = await blob.arrayBuffer();
        if (!cancelled) setDoc({ contentType, pdf });
      } catch (err) {
        if (!cancelled) setError(parseApiError(err));
      }
    })();

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [applicationID, type]);

  return (
    <Modal open setOpen={onClose} title={title} widthClass="sm:max-w-4xl">
      <p className="-mt-2 text-xs text-muted-foreground">
        Recorded against you. Shown here only — it is never saved to this machine.
      </p>

      <div className="mt-4 grid min-h-112 place-items-center overflow-hidden rounded-xl border border-border bg-muted/40">
        {error ? (
          <div className="flex max-w-sm flex-col items-center gap-2 p-8 text-center">
            <ShieldAlert className="size-7 text-muted-foreground" aria-hidden />
            <p className="text-sm text-foreground">{error.detail}</p>
          </div>
        ) : !doc ? (
          <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
        ) : doc.imageUrl ? (
          <img
            src={doc.imageUrl}
            alt={title}
            className="max-h-140 w-full object-contain"
          />
        ) : doc.pdf ? (
          <PdfPages data={doc.pdf} label={title} />
        ) : null}
      </div>
    </Modal>
  );
}
