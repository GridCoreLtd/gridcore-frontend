import { useState } from "react";

import { Eye, FileText, ShieldAlert } from "lucide-react";

import { Button } from "@gridcore/ui/components/ui/button";

import type { Application, DocumentType } from "../types";

import DocumentViewer from "./DocumentViewer";

const labels: Record<DocumentType, string> = {
  CAC: "CAC certificate",
  GOVERNMENT_ID: "Government ID",
};

const order: DocumentType[] = ["CAC", "GOVERNMENT_ID"];

/**
 * The evidence the decision rests on. Opening one is recorded against the
 * operator, so nothing is fetched until it is asked for.
 */
export default function ApplicationDocuments({
  application,
}: {
  application: Application;
}) {
  const [viewing, setViewing] = useState<DocumentType>();
  const attached = application.documents ?? [];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
          Documents
        </h2>
        <span className="text-xs text-muted-foreground">
          Opening one is recorded against you
        </span>
      </div>

      {order.map((type) => {
        const present = attached.includes(type);

        return (
          <div
            key={type}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
          >
            <span
              aria-hidden
              className={
                present
                  ? "grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-secondary"
                  : "grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground"
              }
            >
              {present ? (
                <FileText className="size-5" />
              ) : (
                <ShieldAlert className="size-5" />
              )}
            </span>

            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">{labels[type]}</p>
              <p className="text-xs text-muted-foreground">
                {present
                  ? "Scanned and stored. Opens here, and is not saved to this machine."
                  : "Not attached. Applications filed before this was required may have none."}
              </p>
            </div>

            {present && (
              <Button size="sm" variant="outline" onClick={() => setViewing(type)}>
                <Eye className="size-4" aria-hidden />
                View
              </Button>
            )}
          </div>
        );
      })}

      {viewing && (
        <DocumentViewer
          applicationID={application.id}
          type={viewing}
          title={labels[viewing]}
          onClose={() => setViewing(undefined)}
        />
      )}
    </div>
  );
}
