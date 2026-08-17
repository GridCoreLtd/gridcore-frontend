import type { ReactNode } from "react";

import classNames from "classnames";
import { Info } from "lucide-react";

import Pagination from "@gridcore/ui/components/Pagination";

export interface TableColumn {
  label: string;
  key: string;
  formatter?: (value: any) => string;
  emphasized?: boolean;
}

interface TableProps {
  columns: TableColumn[];
  data: any[];
  currentPage?: number;
  totalPages?: number;
  loading?: boolean;
  setCurrentPage?: (value: number) => void;
  actions?: (row: any) => ReactNode;
  /**
   * Replaces the numbered Pagination. Cursor-paginated screens (D-052) cannot
   * say "page 3 of 5", so they bring their own Previous/Next.
   */
  pager?: ReactNode;
}

const Table = ({
  columns,
  data,
  currentPage,
  totalPages,
  loading = false,
  setCurrentPage,
  actions,
  pager,
}: TableProps) => {

  const getCellValue = (column: TableColumn, row: any) => {
    let value;
  
    if (column.key.includes("---")) {
      const keys = column.key.split("---");
      for (const key of keys) {
        if (row[key] !== undefined && row[key] !== null) {
          value = row[key];
          break;
        }
      }
    } else {
      value = row[column.key];
    }
  
    if (value === undefined || value === null) {
      return "N/A";
    }
  
    return column.formatter ? column.formatter(value) : value;
  };
  


  return (
    <section className="relative min-h-[400px]">
      {loading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <p className="text-gray-500 text-lg">Loading...</p>
        </div>
      )}

      <div className="my-4 flow-root w-full">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            {Array.isArray(data) && data.length > 0 ? (
              <>
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      {columns.map((column, index) => (
                        <th
                          key={`${column.key}-${index}`}
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3"
                        >
                          {column.label}
                        </th>
                      ))}
                      {actions && <th className="py-3.5 pr-3"></th>}
                    </tr>
                  </thead>

                  <tbody className="bg-white">
                    {data.map((row: any, rowIndex) => (
                      <tr
                        key={row.id}
                        className={
                          rowIndex % 2 === 0 ? undefined : "bg-gray-100"
                        }
                      >
                        {columns.map((column, index) => (
                          <td
                            key={`${column.key}-${index}`}
                            className={classNames(
                              column.emphasized
                                ? "text-gray-900 font-medium"
                                : "text-gray-500",
                              "whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-3"
                            )}
                          >
                              {getCellValue(column, row)}
                          </td>
                        ))}
                        {actions && (
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                            {actions(row)}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {pager ?? (
                  <Pagination
                    currentPage={currentPage ?? 1}
                    totalPages={totalPages ?? 1}
                    onPageChange={(page: number) => setCurrentPage?.(page)}
                    className="mt-7 mb-2"
                  />
                )}
              </>
            ) : (
              !loading && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <Info className="h-12 w-12 text-accent mx-auto" />
                  <h3 className="mt-2 text-lg font-semibold text-gray-900">
                    No Data Found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    The data you are trying to retrieve is currently empty
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Table;
