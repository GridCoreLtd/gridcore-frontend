import Pagination from "@gridcore/ui/components/Pagination";
import classNames from "classnames";
import { ReactNode } from "react";
import { Info } from "lucide-react";

export interface TableColumn {
  label: string;
  key: string;
  formatter?: (value: any) => string;
  emphasized?: boolean;
}

interface TableProps {
  columns: TableColumn[];
  data: any[];
  currentPage: number;
  totalPages: number;
  loading?: boolean;
  setCurrentPage: (value: number) => void;
  actions?: (row: any) => ReactNode;
}

const Table = ({
  columns,
  data,
  currentPage,
  totalPages,
  loading,
  setCurrentPage,
  actions,
}: TableProps) => {
  return (
    <section>
      <div className="my-4 flow-root relative min-h-[400px]">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            {loading && (
              <div className="absolute inset-0 mt-32 text-center left-0 right-0">
                <p className="text-gray-500 text-lg">Loading...</p>
              </div>
            )}

            {!loading && Array.isArray(data) && data.length === 0 ? (
              <div className="text-center mt-32 left-0 right-0 absolute">
                <div>
                  <Info className="h-12 w-12 text-accent mx-auto" />

                  <h3 className="mt-2 text-lg font-semibold text-gray-900">
                    No Data Found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    The data you are trying to retrieve is currently empty
                  </p>
                </div>
              </div>
            ) : (
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
                    {data &&
                      data.map((row: any, rowIndex) => (
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
                              {row[column.key] === undefined ||
                              row[column.key] === null ? (
                                <span>N/A</span>
                              ) : column.formatter ? (
                                column.formatter(row[column.key])
                              ) : (
                                row[column.key]
                              )}
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

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page: number) => setCurrentPage(page)}
                  className="mt-7 mb-2"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Table;
