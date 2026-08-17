import classNames from "classnames";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ServerPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  className?: string;
}

const ServerPagination: React.FC<ServerPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize = 10,
  onPageSizeChange,
  className,
}) => {
  const pages: (number | string)[] = [];
  const numAdjacentPages = 2;

  // ... (rest of the page logic remains same)
  if (totalPages > 0) {
    pages.push(1);
  }

  for (let i = currentPage - numAdjacentPages; i < currentPage; i++) {
    if (i > 1) {
      pages.push(i);
    }
  }

  if (currentPage > 1 && currentPage < totalPages) {
    pages.push(currentPage);
  }

  for (let i = currentPage + 1; i < currentPage + numAdjacentPages; i++) {
    if (i < totalPages) {
      pages.push(i);
    }
  }

  if (totalPages > 1) {
    pages.push(totalPages);
  }

  const uniquePages = Array.from(new Set(pages)).sort(
    (a, b) => (a as number) - (b as number)
  );

  const displayPages: (number | string)[] = [];
  if (uniquePages.length > 0) {
    displayPages.push(uniquePages[0]);
    for (let i = 1; i < uniquePages.length; i++) {
      if ((uniquePages[i] as number) - (uniquePages[i - 1] as number) > 1) {
        displayPages.push("...");
      }
      displayPages.push(uniquePages[i]);
    }
  }

  const buttons = displayPages.map((page, index) => {
    const isCurrent = typeof page === "number" && page === currentPage;

    return (
      <button
        key={index}
        className={classNames(
          "relative z-10 inline-flex items-center rounded-sm text-xs font-semibold focus:z-20 px-4 sm:px-3 h-[30px] sm:h-[27px]",
          isCurrent
            ? "gradient-bg text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            : "text-gray-900 bg-gray-200 shadow-xs hover:bg-gray-50 focus:outline-offset-0"
        )}
        disabled={typeof page !== "number"}
        onClick={() => typeof page === "number" && onPageChange(page)}
      >
        {page}
      </button>
    );
  });

  return (
    <section
      className={classNames(
        "flex flex-col sm:flex-row items-center justify-between gap-4 mt-6",
        className
      )}
    >
      <div className="flex items-center gap-4 text-xs text-gray-600 font-medium">
        <span>
          Page {currentPage} of {Math.max(totalPages, 1)}
        </span>
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-gray-100 border border-gray-300 rounded-sm px-2 py-1 outline-hidden focus:border-primary w-[65px]"
            >
              {[5, 10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className={classNames(
              currentPage <= 1
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gray-200 text-gray-900 hover:bg-gray-50",
              "relative inline-flex items-center shadow-xs rounded-sm px-3 sm:px-2 h-[30px] sm:h-[27px] text-xs focus:z-20 focus:outline-offset-0"
            )}
          >
            <span className="sr-only">Previous</span>
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="flex items-center space-x-2">{buttons}</div>

          <button
            onClick={() =>
              currentPage < totalPages && onPageChange(currentPage + 1)
            }
            disabled={currentPage >= totalPages}
            className={classNames(
              currentPage >= totalPages
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gray-200 text-gray-900 hover:bg-gray-50",
              "relative inline-flex items-center shadow-xs rounded-sm px-3 sm:px-2 h-[30px] sm:h-[27px] text-xs focus:z-20 focus:outline-offset-0"
            )}
          >
            <span className="sr-only">Next</span>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
};

export default ServerPagination;
