
import { format } from "date-fns";
import { CalendarDays, CircleAlert, MessagesSquare, RefreshCw, Store, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "@gridcore/ui/components/Button";
import SectionLoader from "@/components/shared/SectionLoader";

import { useMessageDetail } from "../hooks/useBulkMessaging";
import { type MessageStatus, STATUS_COLORS } from "../types";


function sentenceCase(s: string) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function MessageDetailView({ id }: { id: string }) {
  const navigate = useNavigate();
  const { detail, loading, retry, retryLoading } = useMessageDetail(id);

  if (loading) return <SectionLoader height={300} />;
  if (!detail) {
    return (
      <main className="container max-w-full">
        <p className="text-gray-500">Message not found.</p>
        <button
          type="button"
          onClick={() => navigate("/bulk-messaging?tab=logs")}
          className="mt-4 text-primary font-medium hover:underline"
        >
          Back to Message Logs
        </button>
      </main>
    );
  }

  const failedCount =
    detail.failedCount ??
    detail.recipients?.filter((r) => r.status === "FAILED").length ??
    0;
  const showFailureBanner = failedCount > 0;

  return (
    <main className="container max-w-full">
      <h1 className="text-2xl font-medium text-gray-900 mb-6">
        Message Details
      </h1>

      {showFailureBanner && (
        <div className="flex items-center justify-between gap-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 mb-6">
          <div className="flex items-center gap-3">
            <CircleAlert className="h-6 w-6 text-red-600 shrink-0" />
            <span className="font-medium text-gray-900">
              Message Failed ({failedCount})
            </span>
          </div>
          <Button
            text={retryLoading ? "Retrying..." : "Retry"}
            onClick={() => retry()}
            isLoading={retryLoading}
            isDisabled={retryLoading}
            prefixIcon={<RefreshCw className="h-4 w-4" />}
            variant="destructive"
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-100 rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-accent text-xs mb-1">
            <CalendarDays className="h-4 w-4" />
            Sent On
          </div>
          <div className="font-semibold text-gray-900">
            {detail.sentAt
              ? format(new Date(detail.sentAt), "yyyy-MM-dd HH:mm:ss")
              : "—"}
          </div>
        </div>
        <div className="bg-gray-100 rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-accent text-xs mb-1">
            <User className="h-4 w-4" />
            Sent By
          </div>
          <div className="font-semibold text-gray-900">
            {detail.sentBy ?? "—"}
          </div>
        </div>
        <div className="bg-gray-100 rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-accent text-xs mb-1">
            <MessagesSquare className="h-4 w-4" />
            Channel
          </div>
          <div className="font-semibold text-gray-900">
            {detail.channel ?? "—"}
          </div>
        </div>
      </div>
      <div className="sm:col-span-1 mb-6">
        <div className="bg-gray-100 rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-accent text-xs mb-1">
            <Store className="h-4 w-4" />
            Recipient Type
          </div>
          <div className="font-semibold text-gray-900">
            {sentenceCase(
              String(detail.recipientType ?? "").replace(",", ", "),
            )}
          </div>
        </div>
      </div>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Recipients</h2>
        <div className="border border-gray-200 rounded-lg overflow-hidden max-h-[200px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2.5 px-3 text-left text-xs font-medium uppercase text-gray-500">
                  NAME
                </th>
                <th className="py-2.5 px-3 text-left text-xs font-medium uppercase text-gray-500">
                  EMAIL
                </th>
                <th className="py-2.5 px-3 text-left text-xs font-medium uppercase text-gray-500">
                  PHONE
                </th>
                <th className="py-2.5 px-3 text-left text-xs font-medium uppercase text-gray-500">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {(detail.recipients ?? []).map((r, i) => (
                <tr key={i}>
                  <td className="py-2.5 px-3 text-sm text-gray-900">
                    {r.name ?? "—"}
                  </td>
                  <td className="py-2.5 px-3 text-sm text-gray-500">
                    {r.email ?? "—"}
                  </td>
                  <td className="py-2.5 px-3 text-sm text-gray-900">
                    {r.phone ?? "—"}
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusPill status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Message Content
        </h2>
        <div className="space-y-3">
          <div className="bg-gray-100 rounded-lg border border-gray-200 p-4">
            <div className="text-xs text-accent mb-1">Title</div>
            <div className="font-semibold text-gray-900">
              {detail.title ?? "—"}
            </div>
          </div>
          <div className="bg-gray-100 rounded-lg border border-gray-200 p-4">
            <div className="text-xs text-accent mb-1">Content</div>
            <div className="text-sm text-gray-900 whitespace-pre-wrap">
              {detail.content ?? "—"}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6">
        <button
          type="button"
          onClick={() => navigate("/bulk-messaging?tab=logs")}
          className="text-primary font-medium hover:underline"
        >
          Back to Message Logs
        </button>
      </div>
    </main>
  );
}

function StatusPill({ status }: { status: MessageStatus }) {
  const bg = STATUS_COLORS[status] || "bg-gray-500";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white ${bg}`}
    >
      <span className="h-1 w-1 rounded-full bg-white" />
      {sentenceCase(status)}
    </span>
  );
}
