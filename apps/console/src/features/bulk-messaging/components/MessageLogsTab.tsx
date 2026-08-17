
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { RefreshCw, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { parseApiError, toastMessage } from "@gridcore/api-client";
import axiosInstance from "@/utils/axios-instance";

import { useMessageLogs } from "../hooks/useBulkMessaging";
import { type MessageLog, type MessageStatus, STATUS_COLORS } from "../types";



function sentenceCase(s: string) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function truncate(str: string, len: number) {
  if (!str) return "";
  return str.length <= len ? str : str.slice(0, len) + "...";
}

export function MessageLogsTab() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logs, loading, searchLogs, setSearchLogs } = useMessageLogs();

  const retryMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.post(`/bulk-messaging/logs/${id}/retry`);
    },
    onSuccess: () => {
      toast.success("Retry initiated");
      queryClient.invalidateQueries({ queryKey: ["bulk-messaging-logs"] });
    },
    onError: (err: any) => {
      toast.error(toastMessage(parseApiError(err)));
    },
  });

  const handleRowClick = (id: string) => {
    navigate(`/bulk-messaging/logs/${id}`);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Message Logs
        </h3>
        <div className="relative rounded-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-700" />
          </div>
          <input
            type="search"
            placeholder="Search messages..."
            value={searchLogs}
            onChange={(e) => setSearchLogs(e.target.value)}
            className="block w-full rounded-md border-0 py-2 pl-10 pr-3 ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-gray-300 text-sm"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No message logs found.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pl-6"
                >
                  DATE/TIME
                </th>
                <th
                  scope="col"
                  className="py-3.5 px-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                >
                  RECIPIENT TYPE
                </th>
                <th
                  scope="col"
                  className="py-3.5 px-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                >
                  MESSAGE SNIPPET
                </th>
                <th
                  scope="col"
                  className="py-3.5 pl-3 pr-4 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pr-6"
                >
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {logs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => handleRowClick(log.id)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">
                    {log.sentAt
                      ? format(new Date(log.sentAt), "yyyy-MM-dd HH:mm:ss")
                      : "—"}
                  </td>
                  <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-900">
                    {sentenceCase(
                      String(log.recipientType ?? "").replace(",", ", "),
                    )}
                  </td>
                  <td className="py-4 px-3 text-sm text-gray-500 max-w-xs">
                    {truncate(log.messageSnippet ?? "", 40)}
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-4 sm:pr-6">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={log.status} />
                      {log.status === "FAILED" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            retryMutation.mutate(log.id);
                          }}
                          disabled={retryMutation.isPending}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                          title="Retry"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: MessageStatus }) {
  const bg = STATUS_COLORS[status] || "bg-gray-500";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white ${bg}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white" />
      {sentenceCase(status)}
    </span>
  );
}
