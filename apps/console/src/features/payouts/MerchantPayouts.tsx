
import classNames from "classnames";
import { Banknote, CircleCheck, CircleX } from "lucide-react";

import ButtonExport from "@/components/shared/Button/ButtonExport";
import { DatePicker } from "@/components/shared/DatePicker";
import SearchInput from "@/components/shared/SearchInput";
import SectionLoader from "@/components/shared/SectionLoader";
import TanStackTable from "@/components/shared/TanStackTable";
import { currencyFormatter } from "@/utils/formatters";

import { usePayoutService } from "./hooks/usePayoutService";

const TABS = [
  { id: "all" as const, label: "All Transactions" },
  { id: "SUCCESS" as const, label: "Successful" },
  { id: "FAILED" as const, label: "Failed" },
  { id: "PENDING" as const, label: "Pending" },
];

export function MerchantPayouts() {
  const {
    payouts,
    loading,
    summaryLoading,
    stats,
    tabFilter,
    setTabFilter,
    pagination,
    search,
    exportData,
    dateFilter,
    columns,
  } = usePayoutService();

  const statsLoading = summaryLoading;

  return (
    <main className="container max-w-full">
      <h1 className="text-2xl font-medium text-gray-900 mb-6">
        Merchant Payouts
      </h1>

      <section className="mb-8 mt-14">
        {statsLoading && <SectionLoader height={100} />}
        {!statsLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="relative">
              <div className="bg-blue-100 rounded-full absolute -top-6 left-0 right-0 mx-auto w-12 h-12 flex justify-center items-center">
                <Banknote className="w-6 h-6 text-blue-600" />
              </div>
              <div className="border z-0 bg-white w-full px-4 pt-9 pb-4 rounded-md text-center">
                <div className="text-accent text-xs uppercase tracking-wide mb-0.5">
                  Total Payouts
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {currencyFormatter.format(stats.totalAmount)}
                </div>
                <div className="text-accent text-[0.65rem] mt-1">
                  {stats.totalCount} transactions
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-green-100 rounded-full absolute -top-6 left-0 right-0 mx-auto w-12 h-12 flex justify-center items-center">
                <CircleCheck className="w-6 h-6 text-green-600" />
              </div>
              <div className="border z-0 bg-white w-full px-4 pt-9 pb-4 rounded-md text-center">
                <div className="text-accent text-xs uppercase tracking-wide mb-0.5">
                  Successful
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-green-600">
                  {currencyFormatter.format(stats.successAmount)}
                </div>
                <div className="text-accent text-[0.65rem] mt-1">
                  {stats.successCount} transactions
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-red-100 rounded-full absolute -top-6 left-0 right-0 mx-auto w-12 h-12 flex justify-center items-center">
                <CircleX className="w-6 h-6 text-red-600" />
              </div>
              <div className="border z-0 bg-white w-full px-4 pt-9 pb-4 rounded-md text-center">
                <div className="text-accent text-xs uppercase tracking-wide mb-0.5">
                  Failed
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-red-600">
                  {currencyFormatter.format(stats.failedAmount)}
                </div>
                <div className="text-accent text-[0.65rem] mt-1">
                  {stats.failedCount} transactions
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <div
        className="border-b border-gray-200"
        style={{ marginBottom: "35px" }}
      >
        <nav className="flex gap-6" aria-label="Tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTabFilter(tab.id)}
              className={classNames(
                "pb-4 pt-1 text-sm font-medium border-b-2 transition-colors relative",
                tabFilter === tab.id
                  ? "text-gray-900 border-secondary bg-transparent"
                  : "border-transparent text-accent hover:text-gray-600 hover:border-gray-300",
              )}
              style={
                tabFilter === tab.id
                  ? { borderBottomColor: "#E0E04C" }
                  : undefined
              }
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="w-full bg-white rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-gray-100">
        <div className="px-4 sm:px-6 py-4 flex w-full items-center justify-between gap-4 border-b border-gray-200">
          <div className="min-w-0 flex-1 max-w-md">
            <SearchInput
              register={search.register}
              id={search.id}
              placeholder={search.placeholder}
            />
          </div>
          <div className="shrink-0 ml-auto flex items-center gap-3">
            <DatePicker
              mode="range"
              selected={dateFilter.dateRange}
              onSelect={dateFilter.setDateRange}
              placeholderText="Date range"
            />
            <ButtonExport
              handleDownload={exportData.onExport}
              disabled={exportData.isLoading}
            >
              {exportData.isLoading ? "Exporting..." : "Export"}
            </ButtonExport>
          </div>
        </div>

        <div className="px-4 sm:px-6 pb-4">
          <TanStackTable
            columns={columns}
            data={payouts}
            loading={loading}
            pageCount={pagination.totalPages}
            pagination={{
              pageIndex: pagination.currentPage - 1,
              pageSize: pagination.pageSize,
            }}
            setPagination={(next) => {
              pagination.setCurrentPage(next.pageIndex + 1);
              if (next.pageSize !== pagination.pageSize)
                pagination.setPageSize(next.pageSize);
            }}
          />
        </div>
      </div>
    </main>
  );
}
