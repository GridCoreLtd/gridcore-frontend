import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef} from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

import { useScopes } from "@/auth/useScopes";
import { applyFieldErrors, parseApiError, toastMessage } from "@gridcore/api-client";
import axiosInstance from "@/utils/axios-instance";
import { exportCSVFn } from "@/utils/csv-export";
import { sentenceCaseFormatter } from "@gridcore/ui/lib/format";
import { formatCurrency } from "@gridcore/ui/lib/format";
import { currencyFormatter, dateFormatter } from "@/utils/formatters";



import type { ITopup, ITopupServiceResult } from "../types";



export const useTopupService = (): ITopupServiceResult => {
  const { isPlatform } = useScopes();
  const [topups, setTopups] = useState<ITopup[]>([]);
  const [selectedTopup, setSelectedTopup] = useState<ITopup | null>(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [openTopupDetail, setOpenTopupDetail] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const queryClient = useQueryClient();

  const { register, watch,
    setError,
    getValues,
  } = useForm();
  const searchQuery = watch("topupSearch");
  const [debouncedSearchQuery] = useDebounce(searchQuery || "", 500);

  // Only platform operators can filter across merchants; a merchant’s rows
  // are already scoped to them by the token, so skip the lookup entirely.
  const { data: merchantsData } = useQuery({
    queryKey: ["merchants-list"],
    enabled: isPlatform,
    queryFn: async () => {
      const res = await axiosInstance.get("/merchants?page=1&perPage=100");
      return res.data.data.data;
    },
  });

  const merchantOptions =
    merchantsData?.map((m: any) => ({
      value: m.id,
      label: m.businessName,
    })) || [];

  const statusOptions = [
    { value: "SUCCESS", label: "Success" },
    { value: "FAILED", label: "Failed" },
    { value: "PENDING", label: "Pending" },
    { value: "INITIATED", label: "Initiated" },
  ];

  const topupsQuery = useQuery({
    queryKey: [
      "topups",
      pagination.pageIndex,
      pagination.pageSize,
      debouncedSearchQuery,
      activeFilters,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const filterParams = new URLSearchParams();
      if (activeFilters.merchantId)
        filterParams.append("merchantId", activeFilters.merchantId);
      if (activeFilters.status)
        filterParams.append("status", activeFilters.status);

      const queryString = filterParams.toString();
      const prefix = queryString ? `&${queryString}` : "";

      const res = await axiosInstance.get(
        `/topups?page=${pagination.pageIndex + 1}&perPage=${pagination.pageSize}&search=${debouncedSearchQuery}${prefix}&startDate=${
          startDate ? format(startDate, "yyyy-MM-dd") : null
        }&endDate=${endDate ? format(endDate, "yyyy-MM-dd") : null}`,
      );
      return res.data.data;
    },
    onSuccess(data) {
      setTopups(data.data);
      setTotalPages(data.meta.lastPage);
    },
    keepPreviousData: true,
  });

  const isDefined = (value: any) =>
    value !== undefined &&
    value !== "undefined" &&
    value !== null &&
    value !== "null" &&
    value;

  const type = `${isDefined(endDate) || activeFilters.merchantId ? "export" : "api"}`;

  // CSV Headers (compatible with exportCSVFn format)
  const headers: any[] = [
    {
      label: "Meter No.",
      key: "meter",
      formatter: (value: any) => value?.meter?.meterNumber,
      emphasized: true,
    },
    {
      label: "Payment Ref.",
      key: "transaction",
      formatter: (value: any) =>
        sentenceCaseFormatter(value?.transaction?.reference),
    },
    {
      label: "Customer's Name",
      key: "user",
      formatter: (value: any) =>
        `${value?.user?.firstName} ${value?.user?.lastName}`,
    },
    {
      label: "Merchant",
      key: "user",
      formatter: (value: any) =>
        value?.user?.associatedMerchant?.businessName ?? "N/A",
    },
    {
      label: "Site",
      key: "site",
      formatter: (value: any) => `${value?.user?.site?.name ?? "N/A"}`,
    },
    {
      label: "Amount",
      key: "transaction",
      formatter: (value: any) =>
        currencyFormatter.format(value?.transaction?.amount),
    },
    {
      label: "Site Debt",
      key: "siteDebtSettled",
      formatter: (value: any) =>
        currencyFormatter.format(value?.siteDebtSettled ?? 0),
    },
    {
      label: "Top Up",
      key: "topupAmount",
      formatter: (value: any) =>
        currencyFormatter.format(value?.topupAmount ?? 0),
    },
    {
      label: "Unit",
      key: "noOfUnits",
      formatter: (value: any) => {
        const n = Number(value?.noOfUnits);
        return Number.isFinite(n) ? String(n) : "N/A";
      },
    },
    {
      label: "Token",
      key: "token",
    },
    {
      label: "Status",
      key: "topupStatus",
      formatter: (value: any) => sentenceCaseFormatter(value?.topupStatus),
    },
    {
      label: "Date",
      key: "createdAt",
      formatter: (value: any) => value?.createdAt,
    },
  ];

  const exportFn = useMutation({
    mutationFn: async () => {
      const filterParams = new URLSearchParams();
      if (activeFilters.merchantId)
        filterParams.append("merchantId", activeFilters.merchantId);
      if (activeFilters.status)
        filterParams.append("status", activeFilters.status);

      const queryString = filterParams.toString();
      const prefix = queryString ? `&${queryString}` : "";

      return axiosInstance.get(
        `/topups?type=${type}&page=${pagination.pageIndex + 1}&perPage=${pagination.pageSize}&search=${debouncedSearchQuery}${prefix}&startDate=${
          startDate ? format(startDate, "yyyy-MM-dd") : null
        }&endDate=${endDate ? format(endDate, "yyyy-MM-dd") : null}`,
      );
    },
    onError: (error: any) => {
      const problem = parseApiError(error);
      // Field errors render under their input; only a failure that maps to
      // nothing gets a toast. See architecture/10-api-errors.md.
      if (applyFieldErrors(problem, setError, Object.keys(getValues() ?? {}))) {
        toast.error(toastMessage(problem));
      }
    },
    async onSuccess(data) {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      await exportCSVFn(
        type == "export" ? data?.data : data?.data?.data?.data,
        headers,
        "transaction.csv",
      );
    },
  });

  const handleViewDetail = (topupId: string) => {
    const topup = topups.find((topup) => topup.id === topupId) || null;
    setSelectedTopup(topup);
    setOpenTopupDetail(true);
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination({ pageSize, pageIndex: 0 });
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, pageIndex: page }));
  };

  // Column Helper
  const columnHelper = createColumnHelper<ITopup>();

  const columns = [
    columnHelper.accessor("meter", {
      header: "Meter No.",
      cell: (info) => (
        <span className="font-bold">
          {info.getValue()?.meterNumber || "N/A"}
        </span>
      ),
    }),
    columnHelper.accessor("transaction", {
      header: "Payment Ref.",
      cell: (info) => (
        <span>
          {sentenceCaseFormatter(info.getValue()?.reference) || "N/A"}
        </span>
      ),
    }),
    columnHelper.accessor("user", {
      header: "Customer's Name",
      cell: (info) => (
        <span>{`${info.getValue()?.firstName || ""} ${info.getValue()?.lastName || ""}`}</span>
      ),
    }),
    columnHelper.accessor(
      (row) => row.user?.associatedMerchant?.businessName,
      {
        id: "merchant",
        header: "Merchant",
        cell: (info) => <span>{info.getValue() ?? "N/A"}</span>,
      },
    ),
    columnHelper.accessor("user.site", {
      header: "Site",
      cell: (info) => <span>{info.getValue()?.name ?? "N/A"}</span>,
    }),
    columnHelper.accessor("transaction.amount", {
      header: "Amount",
      cell: (info) => (
        <span>
          {formatCurrency({ country: info.row.original.user?.associatedMerchant?.country, currency: info.row.original.user?.associatedMerchant?.currency, amount: info.getValue() })}
        </span>
      ),
    }),
    columnHelper.accessor((row: any) => row.siteDebtSettled, {
      id: "siteDebtSettled",
      header: "Site Debt",
      cell: (info) => (
        <span>
          {formatCurrency({ country: info.row.original.user?.associatedMerchant?.country, currency: info.row.original.user?.associatedMerchant?.currency, amount: info.getValue() ?? 0 })}
        </span>
      ),
    }),
    columnHelper.accessor((row: any) => row.topupAmount, {
      id: "topupAmount",
      header: "Top Up",
      cell: (info) => (
        <span>
          {formatCurrency({ country: info.row.original.user?.associatedMerchant?.country, currency: info.row.original.user?.associatedMerchant?.currency, amount: info.getValue() ?? 0 })}
        </span>
      ),
    }),
    columnHelper.accessor("noOfUnits", {
      header: "Unit",
      cell: (info) => (
        <span>
          {info.getValue() ? Number(info.getValue()).toFixed(2) : "N/A"}
        </span>
      ),
    }),
    columnHelper.accessor("token", {
      header: "Token",
    }),
    columnHelper.accessor("topupStatus", {
      header: "Status",
      cell: (info) => <span>{sentenceCaseFormatter(info.getValue())}</span>,
    }),
    columnHelper.accessor("createdAt", {
      header: "Date",
      cell: (info) => (
        <span>{dateFormatter.format(new Date(info.getValue()))}</span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => (
        <button
          onClick={() => handleViewDetail(info.row.original.id)}
          className="text-primary font-medium"
        >
          View Details
        </button>
      ),
    }),
  ] as ColumnDef<ITopup, any>[];

  return {
    topups,
    loading: topupsQuery.isFetching,
    pagination: {
      currentPage: pagination.pageIndex + 1,
      totalPages,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange,
      onPageSizeChange: handlePageSizeChange,
    },
    search: {
      register,
      placeholder:
        "Search by meter no, transaction ref and customer and merchant's name",
    },
    filter: {
      activeFilters,
      onApply: setActiveFilters,
      merchantOptions,
      statusOptions,
    },
    dateRange: {
      startDate,
      endDate,
      onDateChange: (range: DateRange | undefined) => {
        setStartDate(range?.from ?? null);
        setEndDate(range?.to ?? null);
      },
      onClear: () => {
        setStartDate(null);
        setEndDate(null);
      },
    },
    exportData: {
      isLoading: exportFn.isLoading,
      onExport: () => exportFn.mutate(),
    },
    detail: {
      open: openTopupDetail,
      setOpen: setOpenTopupDetail,
      selectedTopup,
      onViewDetail: handleViewDetail,
    },
    columns,
  };
};
