import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type Table as TanTable,
  type VisibilityState,
} from "@tanstack/react-table"

import { SearchX } from "lucide-react"

import { Skeleton } from "../ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  loading?: boolean
  /**
   * Cursor mode: the server already paged (and ordered) the rows, so the table
   * renders every row it is given and the screen's own footer drives the query.
   */
  manual?: boolean
  /** Rendered above the table with the live table instance — the toolbar. */
  toolbar?: (table: TanTable<TData>) => React.ReactNode
  /** Rendered below; defaults to the built-in page-size/prev/next footer. */
  footer?: (table: TanTable<TData>) => React.ReactNode
  onRowClick?: (row: TData) => void
}

/**
 * The shadcn data table: TanStack Table inside the styled primitives, with
 * sorting, faceted filtering and column visibility wired. Client-side row
 * models — a screen whose data cannot all be loaded brings its own footer and
 * drives the query instead (D-052's cursor mode).
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  manual = false,
  toolbar,
  footer,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: manual,
    manualFiltering: manual,
    manualSorting: manual,
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div className="flex flex-col gap-4">
      {toolbar?.(table)}

      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              // Shimmer rows in the table's own shape, so nothing jumps on arrival.
              Array.from({ length: 5 }, (_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton
                        className="h-4"
                        style={{ width: `${[70, 45, 55, 85, 60, 40][(i + j) % 6]}%` }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={onRowClick ? "cursor-pointer" : undefined}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-48">
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <span className="grid size-10 place-items-center rounded-full bg-muted">
                      <SearchX className="size-5 text-muted-foreground" aria-hidden />
                    </span>
                    <p className="text-sm font-medium text-foreground">Nothing here</p>
                    <p className="text-sm text-muted-foreground">
                      No rows match — clear a filter or change the search.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {footer?.(table)}
    </div>
  )
}
