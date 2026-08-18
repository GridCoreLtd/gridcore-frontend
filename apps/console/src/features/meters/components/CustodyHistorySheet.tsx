import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { Badge } from "@gridcore/ui/components/ui/badge";
import { Skeleton } from "@gridcore/ui/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@gridcore/ui/components/ui/sheet";

import { dateFormatter } from "@/utils/formatters";

import { listMeterAssignments } from "../api";

/**
 * T2: who held this meter, when — dated spans, newest first, never
 * overwritten. Spans from before cutover carry the legacy registration date
 * as a stated proxy.
 */
export default function CustodyHistorySheet({
  meterId,
  meterNumber,
  open,
  onOpenChange,
}: {
  meterId: string;
  meterNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const query = useQuery({
    queryKey: ["meters", meterId, "assignments"],
    queryFn: () => listMeterAssignments(meterId),
    enabled: open && Boolean(meterId),
    retry: false,
  });

  const spans = query.data?.data ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="shrink-0 border-b px-6 py-5 text-left">
          <SheetTitle>Custody — {meterNumber}</SheetTitle>
          <SheetDescription>
            Who held this meter, and when. A reassignment closes a span; nothing is
            overwritten.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-6 py-5">
          {query.isLoading ? (
            <>
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </>
          ) : spans.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No one has ever held this meter.
            </p>
          ) : (
            spans.map((span) => (
              <div
                key={span.customerId + span.assignedFrom}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div className="min-w-0">
                  <Link
                    to={`/customers/${span.customerId}`}
                    className="truncate text-sm font-medium text-primary hover:underline"
                  >
                    {span.customerName}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {dateFormatter.format(new Date(span.assignedFrom))}
                    {" — "}
                    {span.assignedUntil
                      ? dateFormatter.format(new Date(span.assignedUntil))
                      : "now"}
                  </p>
                </div>
                {!span.assignedUntil ? <Badge variant="secondary">Current</Badge> : null}
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
