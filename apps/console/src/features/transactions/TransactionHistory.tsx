import { X } from "lucide-react";

import { useScopes } from "@/auth/useScopes";
import ButtonExport from "@/components/shared/Button/ButtonExport";
import { DatePicker } from "@/components/shared/DatePicker";
import type { FilterConfig } from "@/components/shared/reusable-filter/FilterInputFactories";
import ReusableTableFilter from "@/components/shared/ReusableTableFilter";
import SearchInput from "@/components/shared/SearchInput";
import SlideOver from "@gridcore/ui/components/overlays/SlideOver";
import TanStackTable from "@/components/shared/TanStackTable";

import { TransactionDetail } from "@/entities/transaction";
import { useTransactionService } from "./hooks/useTransactionService";


export function TransactionHistory() {
  const { isPlatform } = useScopes();
  const {
    transactions,
    loading,
    pagination,
    filter,
    search,
    dateRange,
    exportData,
    detail,
    columns,
  } = useTransactionService();

  const statusOptions = [
    { value: "INITIATED", label: "Initiated" },
    { value: "SUCCESS", label: "Success" },
    { value: "PENDING", label: "Pending" },
    { value: "FAILED", label: "Failed" },
  ];

  const typeOptions = [
    { value: "ENGINEERING_TOKEN", label: "ENGINEERING TOKEN" },
    { value: "TOPUP", label: "TOPUP" },
    { value: "FUNDING", label: "FUNDING" },
    { value: "REFUND", label: "REFUND" },
    { value: "PAYOUT", label: "PAYOUT" },
    { value: "DEBT_PAID", label: "DEBT PAID" },
  ];

  const filterConfig: FilterConfig[] = [
    ...(isPlatform
      ? [
          {
            key: "merchantId",
            label: "Merchant",
            type: "select" as const,
            options: filter.merchantOptions,
            placeholder: "Select Merchant",
          },
        ]
      : []),
    {
      key: "status",
      label: "Status",
      type: "select",
      options: statusOptions,
      placeholder: "Select Status",
    },
    {
      key: "type",
      label: "Type",
      type: "select",
      options: typeOptions,
      placeholder: "Select Type",
    },
  ];

  return (
    <main className="container max-w-full">
      <h2 className="text-2xl font-medium mb-6">Transaction History</h2>

      <div className="flex flex-wrap justify-between items-end gap-4 lg:gap-8 mb-6">
        <div className="flex-1 max-w-md">
          <SearchInput
            register={search.register}
            id={search.id}
            placeholder={search.placeholder}
          />
        </div>

        <div className="flex flex-wrap md:flex-nowrap gap-4">
          <div className="flex items-center gap-2">
            <ReusableTableFilter
              filters={filterConfig}
              onApply={filter.onApply}
              initialValues={filter.activeFilters}
            />
          </div>
          <div className="flex items-center gap-2">
            <DatePicker
              mode="range"
              selected={{
                from: dateRange.startDate,
                to: dateRange.endDate,
              }}
              onSelect={dateRange.onDateChange}
              placeholderText="Select Date Range"
            />
            {(dateRange.startDate || dateRange.endDate) && (
              <X
                className="h-5 w-5 cursor-pointer text-gray-400 hover:text-gray-600"
                onClick={dateRange.onClear}
              />
            )}
          </div>
          <ButtonExport handleDownload={exportData.onExport} disabled={false}>
            {exportData.isLoading ? "Exporting..." : "Export"}
          </ButtonExport>
        </div>
      </div>

      <TanStackTable
        columns={columns}
        data={transactions}
        loading={loading}
        pageCount={pagination.totalPages}
        pagination={{
          pageIndex: pagination.currentPage - 1,
          pageSize: pagination.pageSize,
        }}
        setPagination={(newPagination) => {
          const { pageIndex } = newPagination as {
            pageIndex: number;
            pageSize: number;
          };
          pagination.onPageChange(pageIndex + 1);
        }}
        onPageSizeChange={pagination.onPageSizeChange}
      />

      {detail.open && (
        <SlideOver
          open={detail.open}
          setOpen={detail.setOpen}
          title="Transaction detail"
        >
          <TransactionDetail transaction={detail.selectedTransaction} />
        </SlideOver>
      )}
    </main>
  );
}
