
import { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef} from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { RefreshCw } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

import { useExportPayoutService } from "@/entities/payout";
import { applyFieldErrors, parseApiError, toastMessage } from "@gridcore/api-client";
import axiosInstance from "@/utils/axios-instance";
import { exportCSVFn } from "@/utils/csv-export";
import { sentenceCaseFormatter } from "@gridcore/ui/lib/format";
import { currencyFormatter } from "@/utils/formatters";

import type { Payout, PayoutsSummary } from "../types";




type TabFilter = "all" | "SUCCESS" | "FAILED" | "PENDING";

export function usePayoutService() {
  const { exportFn } = useExportPayoutService();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [tabFilter, setTabFilter] = useState<TabFilter>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { register, watch,
    setError,
    getValues,
  } = useForm();
  const searchQuery = watch("payoutSearch");
  const [debouncedSearchQuery] = useDebounce(searchQuery || "", 500);

  const queryClient = useQueryClient();

  const statusParam =
    tabFilter === "all" ? "" : tabFilter;

  const payoutsQuery = useQuery({
    queryKey: [
      "payouts-list",
      currentPage,
      pageSize,
      debouncedSearchQuery,
      tabFilter,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(currentPage),
        perPage: String(pageSize),
        search: debouncedSearchQuery || "",
      });
      if (statusParam) params.append("status", statusParam);
      const res = await axiosInstance.get(
        `/payments/get-payouts?${params.toString()}`
      );
      const payload = res.data?.data ?? res.data ?? res;
      return payload as { data: Payout[]; meta: { total: number; lastPage: number } };
    },
    keepPreviousData: true,
  });

  const summaryQuery = useQuery({
    queryKey: ["payouts-summary"],
    queryFn: async () => {
      const res = await axiosInstance.get("/payments/payouts-summary");
      const raw = res.data?.data ?? res.data;
      const summary = typeof raw?.data === "object" && raw.data != null ? raw.data : raw;
      return summary as PayoutsSummary;
    },
    retry: false,
  });

  const payouts = payoutsQuery.data?.data ?? [];
  const meta = payoutsQuery.data?.meta;
  const totalPages = meta?.lastPage ?? 0;

  const summary = summaryQuery.data;
  const toNum = (v: unknown) => (typeof v === "number" && !Number.isNaN(v) ? v : 0);
  const stats = summary
    ? {
        totalAmount: toNum(summary.totalAmount),
        totalCount: toNum(summary.totalCount),
        successAmount: toNum(summary.successAmount),
        successCount: toNum(summary.successCount),
        failedAmount: toNum(summary.failedAmount),
        failedCount: toNum(summary.failedCount),
      }
    : (() => {
        const all = payoutsQuery.data?.data ?? [];
        const success = all.filter((p) => p.status === "SUCCESS");
        const failed = all.filter((p) => p.status === "FAILED");
        return {
          totalAmount: all.reduce((s, p) => s + (p.amount ?? 0), 0),
          totalCount: all.length,
          successAmount: success.reduce((s, p) => s + (p.amount ?? 0), 0),
          successCount: success.length,
          failedAmount: failed.reduce((s, p) => s + (p.amount ?? 0), 0),
          failedCount: failed.length,
        };
      })();

  const retryMutation = useMutation({
    mutationFn: async (payoutId: string) => {
      const res = await axiosInstance.post("/payments/retry-payout/", {
        payoutId,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Payout retry initiated successfully");
      queryClient.invalidateQueries({ queryKey: ["payouts-list"] });
      queryClient.invalidateQueries({ queryKey: ["payouts-summary"] });
    },
    onError: (err: any) => {
      const problem = parseApiError(err);
      // Field errors render under their input; only a failure that maps to
      // nothing gets a toast. See architecture/10-api-errors.md.
      if (applyFieldErrors(problem, setError, Object.keys(getValues() ?? {}))) {
        toast.error(toastMessage(problem));
      }
    },
  });

  const columnHelper = createColumnHelper<Payout>();

  const columns: ColumnDef<Payout, any>[] = [
    columnHelper.accessor("reference", {
      header: "REFERENCE",
      cell: (info) => (
        <span className="text-gray-900 font-medium">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor(
      (row) => row.merchantName ?? row.merchant?.businessName ?? "—",
      {
        id: "merchantName",
        header: "MERCHANT",
        cell: (info) => (
          <span className="text-gray-900 font-medium">{info.getValue()}</span>
        ),
      }
    ),
    columnHelper.accessor("bankName", {
      header: "BANK NAME",
    }),
    columnHelper.accessor("bankAccountNumber", {
      header: "ACCOUNT NUMBER",
    }),
    columnHelper.accessor("amount", {
      header: "AMOUNT",
      cell: (info) => (
        <span className="font-bold text-gray-900">
          {currencyFormatter.format(info.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor("status", {
      header: "STATUS",
      cell: (info) => {
        const status = info.getValue() || info.row.original.status || "";
        if (!status) return <span className="text-gray-400">—</span>;
        const isSuccess = status === "SUCCESS";
        const isFailed = status === "FAILED";
        const isPending = status === "PENDING";
        const bg = isSuccess
          ? "bg-green-600"
          : isFailed
            ? "bg-red-600"
            : isPending
              ? ""
              : "bg-gray-500";
        const pendingStyle = isPending
          ? { backgroundColor: "#E0E04C", color: "#1f2937" }
          : undefined;
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${!isPending ? "text-white" : ""} ${bg}`}
            style={pendingStyle}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isPending ? "bg-gray-700" : "bg-white"}`} />
            {sentenceCaseFormatter(status)}
          </span>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      header: "DATE",
      cell: (info) => (
        <span className="text-gray-500 whitespace-nowrap">
          {format(new Date(info.getValue()), "yyyy-MM-dd HH:mm:ss")}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "ACTIONS",
      cell: (info) => (
        <RetryPayoutAction
          payout={info.row.original}
          onRetry={() => retryMutation.mutate(info.row.original.id)}
          isPending={retryMutation.isPending}
        />
      ),
    }),
  ];

  return {
    payouts,
    loading: payoutsQuery.isFetching,
    summaryLoading: summaryQuery.isFetching,
    stats,
    tabFilter,
    setTabFilter,
    pagination: {
      currentPage,
      totalPages,
      pageSize,
      setCurrentPage,
      setPageSize,
    },
    search: {
      register,
      id: "payoutSearch",
      placeholder:
        "Search by merchant, reference, or account number...",
    },
    exportData: {
      isLoading: exportFn.isLoading,
      onExport: () =>
        exportFn.mutate({
          status: statusParam || undefined,
          startDate: dateRange?.from
            ? format(dateRange.from, "yyyy-MM-dd")
            : undefined,
          endDate: dateRange?.to
            ? format(dateRange.to, "yyyy-MM-dd")
            : undefined,
        }),
    },
    dateFilter: { dateRange, setDateRange },
    columns,
  };
}

function RetryPayoutAction({
  payout,
  onRetry,
  isPending,
}: {
  payout: Payout;
  onRetry: () => void;
  isPending: boolean;
}) {
  if (payout.status !== "FAILED") return <span className="text-gray-400">—</span>;
  return (
    <button
      type="button"
      onClick={onRetry}
      disabled={isPending}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
      title="Retry payout"
    >
      <RefreshCw className="h-4 w-4" />
    </button>
  );
}

