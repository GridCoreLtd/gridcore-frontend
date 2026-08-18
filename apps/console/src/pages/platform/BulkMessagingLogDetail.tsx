import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { parseApiError, toastMessage } from "@gridcore/api-client";
import { toast } from "sonner";

import { Badge } from "@gridcore/ui/components/ui/badge";
import { Button } from "@gridcore/ui/components/ui/button";
import { Skeleton } from "@gridcore/ui/components/ui/skeleton";

import {
  getBulkMessage,
  listBulkRecipients,
  retryBulkMessage,
  type BulkRecipient,
} from "@/features/bulk-messaging";
import { dateFormatter } from "@/utils/formatters";

/**
 * One campaign: meta, body, retry when it finished badly, and the recipient
 * log — PAGINATED (legacy loaded 1,781 rows at once).
 */
export default function BulkMessagingLogDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [pages, setPages] = useState<BulkRecipient[][]>([]);

  const campaign = useQuery({
    queryKey: ["bulk-messages", id],
    queryFn: () => getBulkMessage(id ?? ""),
    enabled: Boolean(id),
    retry: false,
  });

  const firstPage = useQuery({
    queryKey: ["bulk-messages", id, "recipients"],
    queryFn: () => listBulkRecipients(id ?? ""),
    enabled: Boolean(id),
  });

  const retry = useMutation({
    mutationFn: () => retryBulkMessage(id ?? ""),
    onSuccess: () => {
      toast.success("Retrying the failed recipients.");
      void queryClient.invalidateQueries({ queryKey: ["bulk-messages"] });
    },
    onError: (err) => toast.error(toastMessage(parseApiError(err))),
  });

  const loadMore = useMutation({
    mutationFn: (after: string) => listBulkRecipients(id ?? "", after),
    onSuccess: (result) => setPages((prev) => [...prev, result.data]),
  });

  const detail = campaign.data;
  const recipients = [...(firstPage.data?.data ?? []), ...pages.flat()];
  const lastID = recipients[recipients.length - 1]?.id;
  const mayHaveMore = recipients.length > 0 && recipients.length % 50 === 0;

  if (campaign.isLoading) {
    return <Skeleton className="h-40 w-full max-w-3xl" />;
  }
  if (!detail) {
    return (
      <p className="text-sm text-muted-foreground">This campaign could not be loaded.</p>
    );
  }

  return (
    <section className="flex max-w-3xl flex-col gap-5">
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-foreground">{detail.title}</h1>
            <p className="text-sm text-muted-foreground">
              {dateFormatter.format(new Date(detail.sentAt))} · {detail.channel} · by{" "}
              {detail.sentBy}
            </p>
          </div>
          {detail.state === "FAILED" || detail.state === "PARTIAL_SUCCESS" ? (
            <Button size="sm" onClick={() => retry.mutate()} disabled={retry.isPending}>
              {retry.isPending ? "Retrying…" : `Retry failed (${detail.failedCount})`}
            </Button>
          ) : null}
        </div>
        <p className="mt-4 text-sm whitespace-pre-wrap text-foreground">{detail.body}</p>
        <div className="mt-4 flex gap-2 text-sm">
          <Badge variant="muted">{detail.recipientCount} recipients</Badge>
          <Badge variant="secondary">{detail.sentCount} sent</Badge>
          {detail.failedCount > 0 ? (
            <Badge variant="destructive">{detail.failedCount} failed</Badge>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground">Recipients</h2>
        <div className="mt-3 flex flex-col gap-2">
          {recipients.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{r.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {detail.channel === "SMS" ? (r.phone ?? "—") : (r.email ?? "—")}
                </p>
              </div>
              {r.deliveryState === "SENT" ? (
                <Badge variant="secondary">Sent</Badge>
              ) : r.deliveryState === "FAILED" ? (
                <Badge variant="destructive">Failed</Badge>
              ) : (
                <Badge variant="muted">Pending</Badge>
              )}
            </div>
          ))}
        </div>
        {mayHaveMore && lastID ? (
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            disabled={loadMore.isPending}
            onClick={() => loadMore.mutate(lastID)}
          >
            {loadMore.isPending ? "Loading…" : "Load more"}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
