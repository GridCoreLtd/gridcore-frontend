import { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef} from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
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


import type { ITransaction, ITransactionServiceResult } from "../types";


export const useTransactionService = (): ITransactionServiceResult => {
  const { isPlatform } = useScopes();
  const [selectedTransaction, setSelectedTransaction] =
    useState<ITransaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [openTranxDetail, setOpenTranxDetail] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  const { register, watch,
    setError,
    getValues,
  } = useForm();
  const searchQuery = watch("transactionSearch");
  const [debouncedSearchQuery] = useDebounce(searchQuery || "", 500);

  const queryClient = useQueryClient();

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

  // Fetch Transactions
  const transactionsQuery = useQuery({
    queryKey: [
      "transactions",
      currentPage,
      pageSize,
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
      if (activeFilters.type)
        filterParams.append("transactionType", activeFilters.type);

      const queryString = filterParams.toString();
      const prefix = queryString ? `&${queryString}` : "";

      const res = await axiosInstance.get(
        `/transactions?page=${currentPage}&perPage=${pageSize}&search=${debouncedSearchQuery}&startDate=${
          startDate ? format(startDate, "yyyy-MM-dd") : null
        }&endDate=${endDate ? format(endDate, "yyyy-MM-dd") : null}${prefix}`,
      );
      return res.data.data;
    },
    keepPreviousData: true,
  });

  const transactions = transactionsQuery.data?.data || [];
  const totalPages = transactionsQuery.data?.meta.lastPage;

  // Handle Exports
    const type = `${endDate ? "export" : "api"}`;

  const headers = [
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
      formatter: (value: any) => currencyFormatter.format(value?.amount),
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
      if (activeFilters.status)
        filterParams.append("status", activeFilters.status);
      if (activeFilters.type) filterParams.append("type", activeFilters.type);

      const queryString = filterParams.toString();
      const prefix = queryString ? `&${queryString}` : "";

      return axiosInstance.get(
        `/transactions?type=${type}&page=${currentPage}&perPage=${pageSize}&search=${debouncedSearchQuery}&startDate=${
          startDate ? format(startDate, "yyyy-MM-dd") : null
        }&endDate=${endDate ? format(endDate, "yyyy-MM-dd") : null}${prefix}`,
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

  // Handlers
  const handlePageChange = (page: number) => setCurrentPage(page);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const handleDateChange = (
    range: import("react-day-picker").DateRange | undefined,
  ) => {
    setStartDate(range?.from);
    setEndDate(range?.to);
  };

  const handleClearDate = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const handleViewDetail = (trnxId: string) => {
    const transaction = transactions.find(
      (trxn: ITransaction) => trxn.id === trnxId,
    );
    setSelectedTransaction(transaction || null);
    setOpenTranxDetail(true);
  };

  // Column Helper
  const columnHelper = createColumnHelper<ITransaction>();

  // Columns Definition
  const columns = [
    columnHelper.accessor("reference", {
      header: "Reference",
    }),
    columnHelper.accessor(
      (row) => `${row.user?.firstName} ${row.user?.lastName}` || "N/A",
      {
        id: "customerName",
        header: "Customer's Name",
      },
    ),
    columnHelper.accessor("amount", {
      header: "Amount",
      cell: (info) =>
        formatCurrency({ country: info.row.original.user?.associatedMerchant.country, currency: info.row.original.user?.associatedMerchant?.currency, amount: info.getValue() }),
    }),
    columnHelper.accessor("type", {
      header: "Type",
      cell: (info) => sentenceCaseFormatter(info.getValue()),
    }),
    columnHelper.accessor("source", {
      header: "Channel",
      cell: (info) => sentenceCaseFormatter(info.getValue()),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            info.getValue() === "SUCCESS"
              ? "bg-green-50 text-green-500"
              : info.getValue() === "PENDING"
                ? "bg-yellow-50 text-yellow-500"
                : "bg-red-50 text-red-500"
          }`}
        >
          {sentenceCaseFormatter(info.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor((row) => row.user?.site?.name || "N/A", {
      id: "site",
      header: "Site",
    }),
    columnHelper.accessor(
      (row) =>
        row.merchant?.businessName ??
        row.user?.associatedMerchant?.businessName ??
        "N/A",
      {
        id: "associatedMerchant",
        header: "Associated Merchant",
      },
    ),
    columnHelper.accessor("createdAt", {
      header: "Date",
      cell: (info) => dateFormatter.format(new Date(info.getValue())),
    }),
    columnHelper.display({
      id: "actions",
      header: "Action",
      cell: (info) => (
        <button
          onClick={() => handleViewDetail(info.row.original.id)}
          className="text-primary font-medium hover:underline"
        >
          View Details
        </button>
      ),
    }),
  ] as ColumnDef<ITransaction, any>[];

  const result = {
    transactions,
    loading: transactionsQuery.isFetching,
    pagination: {
      currentPage,
      totalPages,
      pageSize,
      onPageChange: handlePageChange,
      onPageSizeChange: handlePageSizeChange,
    },
    filter: {
      activeFilters,
      onApply: setActiveFilters,
      merchantOptions,
    },
    search: {
      register,
      id: "transactionSearch",
      placeholder: "Search by transaction reference",
    },
    dateRange: {
      startDate,
      endDate,
      onDateChange: handleDateChange,
      onClear: handleClearDate,
    },
    exportData: {
      isLoading: exportFn.isLoading,
      onExport: () => exportFn.mutate(),
    },
    detail: {
      open: openTranxDetail,
      setOpen: setOpenTranxDetail,
      selectedTransaction,
      onViewDetail: handleViewDetail,
    },
    columns,
  };

  return result;
};
