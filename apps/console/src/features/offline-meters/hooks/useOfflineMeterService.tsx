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



import type { IOfflineTransaction, IOfflineMeterServiceResult } from "../types";



export const useOfflineMeterService = (): IOfflineMeterServiceResult => {
  const { isPlatform } = useScopes();
  const [transactions, setTransactions] = useState<IOfflineTransaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] =
    useState<IOfflineTransaction | null>(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [openDetail, setOpenDetail] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [totalCount, setTotalCount] = useState(0);
  const queryClient = useQueryClient();

  const { register, watch, control,
    setError,
    getValues,
  } = useForm();
  const searchQuery = watch("transactionSearch");
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

  const transactionsQuery = useQuery({
    queryKey: [
      "transactions",
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
      if (activeFilters.type)
        filterParams.append("transactionType", activeFilters.type);

      const queryString = filterParams.toString();
      const prefix = queryString ? `&${queryString}` : "";

      const res = await axiosInstance.get(
        `/transactions?source=offline&page=${
          pagination.pageIndex + 1
        }&perPage=${pagination.pageSize}&search=${debouncedSearchQuery}${prefix}&startDate=${
          startDate ? format(startDate, "yyyy-MM-dd") : null
        }&endDate=${endDate ? format(endDate, "yyyy-MM-dd") : null}`,
      );
      setTotalCount(res.data?.data?.meta?.total ?? 0);
      return res.data.data;
    },
    onSuccess(data) {
      setTransactions(data.data);
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

  const type = `${isDefined(endDate) ? "export" : "api"}`;

  const headers: any[] = [
    { label: "Reference", key: "reference", emphasized: true },
    {
      label: "Customer's Name",
      key: "user",
      formatter: (value: any) =>
        `${value?.user?.firstName} ${value?.user?.lastName}`,
    },
    {
      label: "Amount",
      key: "amount",
      formatter: (value: any) =>
        formatCurrency({ country: value?.user?.associatedMerchant?.country, currency: value?.user?.associatedMerchant.currency, amount: value?.amount }),
    },
    {
      label: "Type",
      key: "type",
      formatter: (value: any) => sentenceCaseFormatter(value?.type),
    },
    {
      label: "Channel",
      key: "source",
      formatter: (value: any) => sentenceCaseFormatter(value?.source),
    },
    {
      label: "Status",
      key: "status",
      formatter: (value: any) => sentenceCaseFormatter(value?.status),
    },
    {
      label: "Site",
      key: "customer",
      formatter: (value: any) => `${value?.user?.site?.name ?? "N/A"}`,
    },
    {
      label: "Associated Merchant",
      key: "merchant",
      formatter: (value: any) =>
        value?.merchant?.businessName ??
        value?.user?.associatedMerchant?.businessName,
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
      if (activeFilters.type)
        filterParams.append("transactionType", activeFilters.type);

      const queryString = filterParams.toString();
      const prefix = queryString ? `&${queryString}` : "";

      return axiosInstance.get(
        `/transactions?source=offline&type=${type}&page=${
          pagination.pageIndex + 1
        }&perPage=${pagination.pageSize}&search=${debouncedSearchQuery}${prefix}&startDate=${
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

  const handleViewDetail = (id: string) => {
    const transaction = transactions.find((t) => t.id === id) || null;
    setSelectedTransaction(transaction);
    setOpenDetail(true);
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination({ pageSize, pageIndex: 0 });
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, pageIndex: page }));
  };

  // Column Helper
  const columnHelper = createColumnHelper<IOfflineTransaction>();

  const columns = [
    columnHelper.accessor("reference", {
      header: "Reference",
      cell: (info) => <span className="font-bold">{info.getValue()}</span>,
    }),
    columnHelper.accessor("user", {
      header: "Customer's Name",
      cell: (info) => (
        <span>{`${info.getValue()?.firstName || ""} ${
          info.getValue()?.lastName || ""
        }`}</span>
      ),
    }),
    columnHelper.accessor("amount", {
      header: "Amount",
      cell: (info) => <span>{currencyFormatter.format(info.getValue())}</span>,
    }),
    columnHelper.accessor("type", {
      header: "Type",
      cell: (info) => <span>{sentenceCaseFormatter(info.getValue())}</span>,
    }),
    columnHelper.accessor("source", {
      header: "Channel",
      cell: (info) => <span>{sentenceCaseFormatter(info.getValue())}</span>,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => <span>{sentenceCaseFormatter(info.getValue())}</span>,
    }),
    columnHelper.accessor("user.site", {
      header: "Site",
      cell: (info) => <span>{info.getValue()?.name ?? "N/A"}</span>,
    }),
    columnHelper.accessor(
      (row) => row.merchant || row.user?.associatedMerchant,
      {
        id: "associatedMerchant",
        header: "Associated Merchant",
        cell: (info) => <span>{info.getValue()?.businessName || "N/A"}</span>,
      },
    ),
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
  ] as ColumnDef<IOfflineTransaction, any>[];

  return {
    transactions,
    loading: transactionsQuery.isFetching,
    totalCount,
    pagination: {
      currentPage: pagination.pageIndex + 1,
      totalPages,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange,
      onPageSizeChange: handlePageSizeChange,
    },
    search: {
      register,
      placeholder: "Search by transaction reference",
    },
    filter: {
      control,
      activeFilters,
      onApply: setActiveFilters,
      merchantOptions,
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
      open: openDetail,
      setOpen: setOpenDetail,
      selectedTransaction,
      onViewDetail: handleViewDetail,
    },
    columns,
  };
};
