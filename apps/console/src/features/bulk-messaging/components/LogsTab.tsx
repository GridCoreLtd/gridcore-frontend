import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@gridcore/ui/components/ui/badge";
import { Skeleton } from "@gridcore/ui/components/ui/skeleton";

import { dateFormatter } from "@/utils/formatters";

import { listBulkMessages, type BulkMessageSummary } from "../api";

function stateBadge(state: BulkMessageSummary["state"]) {
  switch (state) {
    case "COMPLETED":
      return <Badge variant="secondary">Completed</Badge>;
    case "PARTIAL_SUCCESS":
      return <Badge variant="outline">Partial</Badge>;
    case "FAILED":
      return <Badge variant="destructive">Failed</Badge>;
    default:
      return <Badge variant="muted">{state === "PROCESSING" ? "Sending…" : "Pending"}</Badge>;
  }
}

export default function LogsTab() {
  const query = useQuery({ queryKey: ["bulk-messages"], queryFn: listBulkMessages });
  const rows = query.data?.data ?? [];

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No campaigns yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row) => (
        <Link
          key={row.id}
          to={`/bulk-messaging/logs/${row.id}`}
          className="flex items-center justify-between gap-3 rounded-lg border border-border p-4 hover:bg-muted/50"
        >
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{row.title}</p>
            <p className="text-xs text-muted-foreground">
              {dateFormatter.format(new Date(row.sentAt))} · {row.channel} ·{" "}
              {row.recipientCount} recipient{row.recipientCount === 1 ? "" : "s"}
              {row.failedCount > 0 ? ` · ${row.failedCount} failed` : ""}
              {row.sentBy ? ` · by ${row.sentBy}` : ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {stateBadge(row.state)}
            <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
          </div>
        </Link>
      ))}
    </div>
  );
}
