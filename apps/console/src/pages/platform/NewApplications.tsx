import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef, Table as TanTable } from "@tanstack/react-table";
import { ChevronRight, FileCheck2, FileWarning, Search, X } from "lucide-react";
import { Link } from "react-router-dom";

import {
  DataTable,
  DataTableColumnHeader,
  DataTablePagination,
  DataTableViewOptions,
} from "@gridcore/ui/components/data-table";
import { Badge } from "@gridcore/ui/components/ui/badge";
import { Button } from "@gridcore/ui/components/ui/button";
import { Input } from "@gridcore/ui/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@gridcore/ui/components/ui/tabs";

import {
  listApplications,
  type Application,
  type ApplicationState,
} from "@/features/applications";
import { dateFormatter } from "@/utils/formatters";

const tabs: { value: ApplicationState; label: string }[] = [
  { value: "APPLIED", label: "Awaiting review" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

const stateBadge: Record<ApplicationState, "secondary" | "muted" | "outline"> = {
  APPLIED: "secondary",
  APPROVED: "muted",
  REJECTED: "outline",
};

const columns: ColumnDef<Application>[] = [
  {
    accessorKey: "name",
    meta: { title: "Business" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Business" />,
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{row.getValue("name")}</p>
        <p className="truncate font-mono text-xs text-muted-foreground">
          {row.original.shortBusinessName}.gridcore.test.net
        </p>
      </div>
    ),
    // One box searches the business, its portal address and the applicant.
    filterFn: (row, _id, value: string) =>
      `${row.original.name} ${row.original.shortBusinessName} ${row.original.applicantName}`
        .toLowerCase()
        .includes(value.toLowerCase()),
  },
  {
    accessorKey: "applicantName",
    meta: { title: "Applicant" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Applicant" />,
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate text-foreground">{row.getValue("applicantName")}</p>
        <p className="truncate text-xs text-muted-foreground">
          {row.original.applicantPhone}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "country",
    meta: { title: "Country" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Country" />,
    cell: ({ row }) => <Badge variant="muted">{row.getValue("country")}</Badge>,
  },
  {
    id: "documents",
    meta: { title: "Documents" },
    header: "Documents",
    // Both are required at submission now, so a gap means an older application
    // — the reviewer needs to see that before opening the row, not after.
    cell: ({ row }) => {
      const count = row.original.documents?.length ?? 0;
      if (count === 2) {
        return (
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <FileCheck2 className="size-4" aria-hidden />2 of 2
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-warning/20 px-2 py-0.5 text-sm font-medium text-foreground">
          <FileWarning className="size-4" aria-hidden />
          {count} of 2
        </span>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "submittedAt",
    meta: { title: "Submitted" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Submitted" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {dateFormatter.format(new Date(row.getValue("submittedAt")))}
      </span>
    ),
  },
  {
    accessorKey: "state",
    meta: { title: "Status" },
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={stateBadge[row.original.state]}>{row.original.state}</Badge>
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link
        to={`/merchants/new-applications/${row.original.id}`}
        className="inline-flex items-center gap-0.5 text-sm font-medium text-primary hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        Review
        <ChevronRight className="size-3.5" aria-hidden />
      </Link>
    ),
  },
];

function Toolbar({ table }: { table: TanTable<Application> }) {
  const filtered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search
          className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          placeholder="Search business, portal or applicant…"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-9 w-60 bg-card pl-8 lg:w-80"
        />
      </div>
      {filtered && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => table.resetColumnFilters()}
        >
          Reset
          <X className="size-3.5" />
        </Button>
      )}
      <DataTableViewOptions table={table} />
    </div>
  );
}

/**
 * Story A1 on the v2 contract (blueprint 34): the application queue.
 *
 * The decision itself lives on the review screen, not here — approval creates
 * the merchant and sends a one-time claim link, and it should not be reachable
 * without the documents in front of you.
 */
export default function NewApplications() {
  const [tab, setTab] = useState<ApplicationState>("APPLIED");

  // The whole set in one request, so the tab counts are real rather than the
  // count of whatever the current filter fetched.
  const { data, isLoading } = useQuery({
    queryKey: ["applications", "all"],
    queryFn: () => listApplications(),
  });

  const applications = useMemo(() => data ?? [], [data]);
  const counts = useMemo(
    () =>
      applications.reduce<Record<string, number>>(
        (acc, a) => ({ ...acc, [a.state]: (acc[a.state] ?? 0) + 1 }),
        {}
      ),
    [applications]
  );
  const rows = useMemo(
    () => applications.filter((a) => a.state === tab),
    [applications, tab]
  );

  return (
    <section className="flex flex-col gap-5">
      <p className="-mt-4 text-sm text-muted-foreground">
        Businesses applying to sell on GridCore. Open one to read its documents
        before deciding — approval creates their merchant and sends the sign-in
        link.
      </p>

      {applications.length >= 200 && (
        <p className="rounded-md border border-warning/40 bg-warning/10 px-4 py-2 text-sm">
          Showing the first 200 applications — this screen needs server-side
          paging turned on, and the tab counts below can no longer be trusted.
        </p>
      )}

      <Tabs value={tab} onValueChange={(next) => setTab(next as ApplicationState)}>
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="gap-2">
              {t.label}
              <span className="text-xs tabular-nums opacity-70">
                {counts[t.value] ?? 0}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <DataTable
        columns={columns}
        data={rows}
        loading={isLoading}
        toolbar={(table) => <Toolbar table={table} />}
        footer={(table) => <DataTablePagination table={table} />}
      />
    </section>
  );
}
