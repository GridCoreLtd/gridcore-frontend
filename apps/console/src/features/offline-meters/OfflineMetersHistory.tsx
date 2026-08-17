import { X } from "lucide-react";

import { useScopes } from "@/auth/useScopes";
import ButtonExport from "@/components/shared/Button/ButtonExport";
import { DatePicker } from "@/components/shared/DatePicker"; // Updated DatePicker path
import type { FilterConfig } from "@/components/shared/reusable-filter/FilterInputFactories";
import ReusableTableFilter from "@/components/shared/ReusableTableFilter";
import SearchInput from "@/components/shared/SearchInput";
import SlideOver from "@gridcore/ui/components/overlays/SlideOver";
import TanStackTable from "@/components/shared/TanStackTable";
import { TransactionDetail } from "@/entities/transaction";

import { useOfflineMeterService } from "./hooks/useOfflineMeterService";


const OfflineMetersHistory = () => {
  const { isPlatform } = useScopes();
  const {
    transactions,
    loading,
    totalCount,
    pagination,
    search,
    filter,
    dateRange,
    exportData,
    detail,
    columns,
  } = useOfflineMeterService();

  const typeOptions = [
    { value: "ENGINEERING_TOKEN", label: "ENGINEERING TOKEN" },
    { value: "TOPUP", label: "TOPUP" },
    { value: "FUNDING", label: "FUNDING" },
    { value: "REFUND", label: "REFUND" },
    { value: "PAYOUT", label: "PAYOUT" },
    { value: "DEBT_PAID", label: "DEBT PAID" },
  ];

  const filters: FilterConfig[] = [
    ...(isPlatform
      ? [
          {
            key: "merchantId",
            label: "Merchant",
            type: "select" as const,
            options: filter.merchantOptions,
            placeholder: "Filter by merchant",
          },
        ]
      : []),
    {
      key: "type",
      label: "Type",
      type: "select",
      options: typeOptions,
      placeholder: "Filter by type",
    },
  ];

  return (
    <main className="container max-w-full">
      <h2 className="text-2xl font-medium mb-6">Offline Meters History</h2>

      <div className="flex flex-wrap sm:flex-nowrap justify-between items-end gap-4 lg:gap-8 mb-6">
        <div className="flex-1 max-w-md">
          <SearchInput
            register={search.register}
            id="transactionSearch"
            placeholder={search.placeholder}
          />
        </div>

        <div className="flex flex-wrap md:flex-nowrap gap-4">
          <div className="flex items-center gap-2">
            <ReusableTableFilter
              filters={filters}
              onApply={filter.onApply}
              initialValues={filter.activeFilters}
            />
          </div>
          <div className="flex items-center gap-2">
            <DatePicker
              mode="range"
              selected={{
                from: dateRange.startDate ?? undefined,
                to: dateRange.endDate ?? undefined,
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

      <div className="mb-4">
        Total: <span className="font-bold">{totalCount}</span>
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
        setPagination={(p) => {
          pagination.onPageChange(p.pageIndex);
        }}
        onPageSizeChange={pagination.onPageSizeChange}
      />

      {detail.open && (
        <SlideOver
          open={true}
          setOpen={detail.setOpen}
          title="Transaction detail"
        >
          <TransactionDetail transaction={detail.selectedTransaction} />
        </SlideOver>
      )}
    </main>
  );
};

export default OfflineMetersHistory;
