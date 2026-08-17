import { cn } from "../lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  const pages = [];
  const numAdjacentPages = 2;

  // Add the first page
  pages.push(1);

  // Add the pages before the current page
  for (let i = currentPage - numAdjacentPages; i < currentPage; i++) {
    if (i > 1) {
      pages.push(i);
    }
  }

  // Add the pages after the current page
  for (let i = currentPage + 1; i < currentPage + numAdjacentPages; i++) {
    if (i < totalPages) {
      pages.push(i);
    }
  }

  // Add the last page
  pages.push(totalPages);

  // Add ellipses if necessary
  if (pages[1] - pages[0] > 1) {
    pages.splice(1, 0, NaN);
  }

  if (pages[pages.length - 1] - pages[pages.length - 2] > 1) {
    pages.splice(pages.length - 1, 0, NaN);
  }

  // Generate the pagination buttons
  const buttons = pages.map((page, index) => {
    const isCurrent = typeof page === "number" && page === currentPage;

    return (
      <button
        key={index}
        className={cn(
          "relative z-10 inline-flex items-center rounded-sm text-xs font-semibold focus:z-20 px-4 sm:px-3 h-[30px] sm:h-[27px]",
          isCurrent
            ? "gradient-bg text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            : "text-gray-900 bg-gray-200 shadow-xs hover:bg-gray-50 focus:outline-offset-0"
        )}
        disabled={typeof page !== "number"}
        onClick={() => onPageChange(page as number)}
      >
        {/* display '...' when element is NaN */}
        {isNaN(page as number) ? "..." : page}
      </button>
    );
  });

  return (
    <section>
      {totalPages > 1 && (
        <div
          className={cn(
            "flex flex-wrap sm:justify-end space-x-2",
            className
          )}
        >
          <button
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className={cn(
              currentPage <= 1
                ? "bg-gray-300 text-gray-500"
                : "bg-gray-200 text-gray-900 hover:bg-gray-50",
              "relative inline-flex items-center shadow-xs rounded-sm px-3 sm:px-2 h-[30px] sm:h-[27px] text-xs focus:z-20 focus:outline-offset-0"
            )}
          >
            <span className="sr-only">Previous</span>
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          <span className="space-x-2">{buttons}</span>

          <button
            onClick={() =>
              currentPage < totalPages && onPageChange(currentPage + 1)
            }
            disabled={currentPage >= totalPages}
            className={cn(
              currentPage >= totalPages
                ? "bg-gray-300 text-gray-500"
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

export default Pagination;
