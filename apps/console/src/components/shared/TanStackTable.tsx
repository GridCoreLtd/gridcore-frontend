import type {
  ColumnDef} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import { Info } from "lucide-react";

import ServerPagination from "./ServerPagination";

interface TanStackTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  loading?: boolean;
  pageCount: number;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  setPagination: (pagination: { pageIndex: number; pageSize: number }) => void;
  onPageSizeChange?: (size: number) => void;
}

const TanStackTable = <T extends object>({
  data,
  columns,
  loading = false,
  pageCount,
  pagination,
  setPagination,
  onPageSizeChange,
}: TanStackTableProps<T>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: {
      pagination,
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newPagination = updater(pagination);
        setPagination(newPagination);
      } else {
        setPagination(updater);
      }
    },
  });

  return (
    <section className="relative min-h-[400px]">
      {loading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <p className="text-gray-500 text-lg">Loading...</p>
        </div>
      )}
      <>
        <div className="py-2">
          <div className="overflow-x-auto w-full">
            {Array.isArray(data) && data.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white">
                  {table.getRowModel().rows.map((row, rowIndex) => (
                    <tr
                      key={row.id}
                      className={rowIndex % 2 === 0 ? undefined : "bg-gray-100"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className={classNames(
                            "whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-3",
                            "text-gray-500"
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              !loading && (
                <div className="py-20 text-center">
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

        {Array.isArray(data) && data.length > 0 && (
          <ServerPagination
            currentPage={pagination.pageIndex + 1}
            totalPages={pageCount}
            onPageChange={(page) =>
              setPagination({ ...pagination, pageIndex: page - 1 })
            }
            pageSize={pagination.pageSize}
            onPageSizeChange={onPageSizeChange}
            className="mt-7 mb-2"
          />
        )}
      </>
    </section>
  );
};

export default TanStackTable;
