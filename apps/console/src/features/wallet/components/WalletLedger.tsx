
import axiosInstance from "@/utils/axios-instance";
import { sentenceCaseFormatter } from "@gridcore/ui/lib/format";
import { formatCurrency } from "@gridcore/ui/lib/format";
import { currencyFormatter, dateFormatter } from "@/utils/formatters";

import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";

import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

import ButtonExport from "@/components/shared/Button/ButtonExport";
import Loader from "@gridcore/ui/components/overlays/Loader";
import SearchInput from "@/components/shared/SearchInput";
import TanStackTable from "@/components/shared/TanStackTable";
import { applyFieldErrors, parseApiError, toastMessage } from "@gridcore/api-client";
import { exportCSVFn } from "@/utils/csv-export";

interface Props {
  csvName: string;
  tableTitle: string;
  /**
   * Names a specific wallet to read. Omitted, the server resolves the caller's
   * own wallet from the token. Whether the caller may read a wallet that isn't
   * theirs is the server's decision, not a flag we send.
   */
  walletId?: string;
}

export default function WalletLedger({
  csvName,
  tableTitle,
  walletId,
}: Props) {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [startDate, setStartDate] = useState<any>(null);
  const [endDate, setEndDate] = useState<any>(null);
  const [globalWallet, setGlobalWallet] = useState<any>();

  const { register, watch, control,
    setError,
    getValues,
  } = useForm();
  const searchQuery = watch("transactionSearch");
  const [debouncedSearchQuery] = useDebounce(searchQuery || "", 500);
  const queryClient = useQueryClient();

  const walletScope = walletId ? `&walletId=${walletId}` : "";

  const balanceQuery = useQuery({
    queryKey: ["walletBalance", walletId],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/wallet/balance${walletId ? `?walletId=${walletId}` : ""}`,
      );
      return res.data.data;
    },
    onSuccess(data) {
      setGlobalWallet(data);
    },
  });

  const transactionsQuery = useQuery({
    queryKey: [
      "wallet-ledger",
      pagination.pageIndex,
      debouncedSearchQuery,
      walletId,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/wallet/ledger?page=${
          pagination.pageIndex + 1
        }&perPage=10&search=${debouncedSearchQuery}${walletScope}&startDate=${
          startDate ? format(startDate, "yyyy-MM-dd") : ""
        }&endDate=${endDate ? format(endDate, "yyyy-MM-dd") : ""}`,
      );
      return res.data.data;
    },
    onSuccess(data) {
      setTransactions(data.data);
      setTotalPages(data?.meta?.lastPage);
    },
    keepPreviousData: true,
  });

  const headers = [
    { label: "Reference", key: "reference", emphasized: true },
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
      label: "Through Associated Merchant",
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

  const type = `${endDate ? "export" : "api"}`;

  const exportFn = useMutation({
    mutationFn: async () => {
      return axiosInstance.get(
        `/wallet/ledger?type=${type}&page=${
          pagination.pageIndex + 1
        }&perPage=10&search=${debouncedSearchQuery}${walletScope}&startDate=${
          startDate ? format(startDate, "yyyy-MM-dd") : ""
        }&endDate=${endDate ? format(endDate, "yyyy-MM-dd") : ""}`,
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
        type === "export" ? data?.data : data?.data?.data?.data,
        headers,
        csvName,
      );
    },
  });

  const columns: ColumnDef<any>[] = [
    {
      header: "Reference",
      accessorKey: "reference",
    },
    {
      header: "Amount",
      accessorKey: "amount",
      cell: (info) =>
        formatCurrency({ country: info.row.original.user?.associatedMerchant?.country, currency: info.row.original.user?.associatedMerchant.currency, amount: info.getValue() as number }),
    },
    {
      header: "Type",
      accessorKey: "type",
      cell: (info) => sentenceCaseFormatter(info.getValue() as string),
    },
    {
      header: "Through Associated Merchant",
      accessorFn: (row) =>
        row.merchant?.businessName ??
        row.user?.associatedMerchant?.businessName,
      cell: (info) => info.getValue(),
    },
    {
      header: "Description",
      accessorKey: "reason",
    },
    {
      header: "Date",
      accessorKey: "createdAt",
      cell: (info) => dateFormatter.format(new Date(info.getValue() as string)),
    },
  ];

  return (
    <main className="container max-w-full">
      {balanceQuery.isLoading ? (
        <Loader setOpen={() => true} message="Loading..." />
      ) : (
        <div className="basis-full sm:basis-3/12 bg-primary shadow-xs rounded-md p-6 h-auto">
          <div className="text-gray-300 text-xs mb-1">Wallet Balance</div>
          <div className="text-white font-bold text-2xl">
            {currencyFormatter.format(globalWallet?.balance || 0)}
          </div>
        </div>
      )}

      <h2 className="text-2xl font-medium mb-6 mt-6">{tableTitle}</h2>

      <div className="flex flex-wrap sm:flex-nowrap justify-between items-end gap-4 lg:gap-8 mb-6">
        <div className="flex-1 max-w-md">
          <SearchInput
            register={register}
            id="transactionSearch"
            placeholder="Search by transaction reference"
          />
        </div>

        {/* {!walletId && (
          <div className="min-w-[220px]">
            <FilterByMerchant control={control} name="merchant" />
          </div>
        )} */}

        <div className="w-[400px] flex flex-wrap md:flex-nowrap gap-4">
          <div className="md:w-[420px] flex items-center">
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              placeholderText="Date Range Picker"
              onChange={(dates) => {
                const [start, end] = dates;
                setStartDate(start);
                setEndDate(end);
              }}
              className="w-full text-sm outline-hidden"
              dateFormat="MM-dd-yyyy"
            />
            <X
              className="h-5 w-5 cursor-pointer"
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
              }}
            />
          </div>
          <ButtonExport
            handleDownload={() => exportFn.mutate()}
            disabled={false}
          >
            {exportFn.isLoading ? "Exporting..." : "Export"}
          </ButtonExport>
        </div>
      </div>

      <TanStackTable
        columns={columns}
        data={transactions}
        loading={transactionsQuery.isFetching}
        pageCount={totalPages}
        pagination={pagination}
        setPagination={setPagination}
      />
    </main>
  );
}
