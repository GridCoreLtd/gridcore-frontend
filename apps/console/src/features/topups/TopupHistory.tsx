
import { X } from "lucide-react";

import { useScopes } from "@/auth/useScopes";
import ButtonExport from "@/components/shared/Button/ButtonExport";
import { DatePicker } from "@/components/shared/DatePicker";
import type { FilterConfig } from "@/components/shared/reusable-filter/FilterInputFactories";
import ReusableTableFilter from "@/components/shared/ReusableTableFilter";
import SearchInput from "@/components/shared/SearchInput";
import SlideOver from "@gridcore/ui/components/overlays/SlideOver";
import TanStackTable from "@/components/shared/TanStackTable";

import { TopupDetail } from "@/entities/topup";
import { useTopupService } from "./hooks/useTopupService";


const TopupHistory = () => {
  const { isPlatform } = useScopes();
  const {
    topups,
    loading,
    pagination,
    search,
    filter,
    dateRange,
    exportData,
    detail,
    columns,
  } = useTopupService();

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
      key: "status",
      label: "Status",
      type: "select",
      options: filter.statusOptions,
      placeholder: "Filter by status",
    },
  ];

  return (
    <main className="container max-w-full">
      <h2 className="text-2xl font-medium mb-6">Top Up History</h2>

      <div className="flex flex-wrap sm:flex-nowrap justify-between items-end gap-4 lg:gap-8 mb-6">
        <div className="flex-1 max-w-md">
          <SearchInput
            register={search.register}
            id="topupSearch" // This ID corresponds to the watch key in the hook implicitly via the register
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

      <TanStackTable
        columns={columns}
        data={topups}
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
        <SlideOver open={true} setOpen={detail.setOpen} title="Top up detail">
          <TopupDetail topup={detail.selectedTopup} />
        </SlideOver>
      )}
    </main>
  );
};

export default TopupHistory;
