import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef, Table as TanTable } from "@tanstack/react-table";
import {
  CalendarPlus,
  Coins,
  ExternalLink,
  Globe,
  ChevronRight,
  Inbox,
  Search,
  Store,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  DataTable,
  DataTableColumnHeader,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableViewOptions,
} from "@gridcore/ui/components/data-table";
import { Badge } from "@gridcore/ui/components/ui/badge";
import { Button } from "@gridcore/ui/components/ui/button";
import { Input } from "@gridcore/ui/components/ui/input";
import { Skeleton } from "@gridcore/ui/components/ui/skeleton";
import { listApplications } from "@/features/applications";
import { listMerchants, type Merchant } from "@/features/merchants";
import { dateFormatter, initials } from "@/utils/formatters";

/**
 * The operator's merchant list on the v2 contract (D-052), rendered with the
 * shadcn data table: sortable columns, faceted country/currency filters,
 * column visibility, client-side paging.
 *
 * Client-side because the whole set fits: one request at the API's page
 * ceiling holds every production merchant (45 of ~100). The `hasMore` guard
 * below is the honesty check — the day a deployment outgrows one page, this
 * screen switches to server mode rather than silently filtering a subset.
 */
const columns: ColumnDef<Merchant>[] = [
  {
    accessorKey: "name",
    meta: { title: "Business" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Business" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/5 text-xs font-semibold text-primary"
        >
          {initials(row.getValue("name"))}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">
            {row.getValue("name")}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {row.original.shortBusinessName}
          </p>
        </div>
      </div>
    ),
    // Search matches the subdomain too, so typing either finds the merchant.
    filterFn: (row, _id, value: string) =>
      `${row.original.name} ${row.original.shortBusinessName}`
        .toLowerCase()
        .includes(value.toLowerCase()),
  },
  {
    accessorKey: "country",
    meta: { title: "Country" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Country" />
    ),
    cell: ({ row }) => <Badge variant="muted">{row.getValue("country")}</Badge>,
    filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "currency",
    meta: { title: "Currency" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Currency" />
    ),
    cell: ({ row }) => <Badge variant="muted">{row.getValue("currency")}</Badge>,
    filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "address",
    meta: { title: "Address" },
    header: "Address",
    cell: ({ row }) => (
      <span className="block max-w-[28ch] truncate text-muted-foreground">
        {row.getValue("address")}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "website",
    meta: { title: "Website" },
    header: "Website",
    cell: ({ row }) => {
      const site = row.original.website;
      if (!site) return <span className="text-muted-foreground">—</span>;
      return (
        <a
          href={site}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {new URL(site).hostname}
          <ExternalLink className="size-3" aria-hidden />
        </a>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "createdAt",
    meta: { title: "Since" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Since" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {dateFormatter.format(new Date(row.getValue("createdAt")))}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link
        to={`/merchants/${row.original.id}`}
        className="inline-flex items-center gap-0.5 text-sm font-medium text-primary hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        View
        <ChevronRight className="size-3.5" aria-hidden />
      </Link>
    ),
  },
];

function Toolbar({ table }: { table: TanTable<Merchant> }) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const facet = (id: string) =>
    Array.from(
      table.getColumn(id)?.getFacetedUniqueValues()?.keys() ?? []
    ).map((value) => ({ label: String(value), value: String(value) }));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search
          className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          placeholder="Search name or subdomain…"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-9 w-60 bg-card pl-8 lg:w-72"
        />
      </div>
      <DataTableFacetedFilter
        column={table.getColumn("country")}
        title="Country"
        options={facet("country")}
      />
      <DataTableFacetedFilter
        column={table.getColumn("currency")}
        title="Currency"
        options={facet("currency")}
      />
      {isFiltered && (
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

type Tile = {
  label: string;
  value: number;
  icon: typeof Store;
  accent?: boolean;
};

function StatTiles({ merchants, loading }: { merchants: Merchant[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
            <Skeleton className="size-11 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const now = new Date();
  // Chips alternate the two brand colours — navy, lemon, navy, lemon.
  const tiles: Tile[] = [
    { label: "Merchants", value: merchants.length, icon: Store },
    {
      label: "Countries",
      value: new Set(merchants.map((m) => m.country)).size,
      icon: Globe,
      accent: true,
    },
    {
      label: "Currencies",
      value: new Set(merchants.map((m) => m.currency)).size,
      icon: Coins,
    },
    {
      label: "New this month",
      value: merchants.filter((m) => {
        const created = new Date(m.createdAt);
        return (
          created.getMonth() === now.getMonth() &&
          created.getFullYear() === now.getFullYear()
        );
      }).length,
      icon: CalendarPlus,
      accent: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-5"
        >
          <span
            aria-hidden
            className={
              tile.accent
                ? "grid size-11 shrink-0 place-items-center rounded-lg bg-secondary/25 text-secondary-foreground"
                : "grid size-11 shrink-0 place-items-center rounded-lg bg-primary/5 text-primary"
            }
          >
            <tile.icon className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-2xl font-semibold tracking-tight text-foreground">
              {tile.value}
            </p>
            <p className="truncate text-sm text-muted-foreground">{tile.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Merchants() {
  const query = useQuery({
    queryKey: ["merchants", "all"],
    queryFn: () => listMerchants({ pageSize: 100 }),
  });

  const merchants = useMemo(() => query.data?.data ?? [], [query.data]);

  // The queue is the only way in to the applications screen, so the count is
  // the whole point of the link: nothing else tells an operator to go and look.
  const applications = useQuery({
    queryKey: ["applications", "all"],
    queryFn: () => listApplications(),
  });
  const awaiting =
    applications.data?.filter((a) => a.state === "APPLIED").length ?? 0;

  return (
    <section className="flex flex-col gap-5">
      {/* The layout header already names the page; repeating it here was noise. */}
      <div className="-mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Every merchant operating on the platform.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link to="/merchants/new-applications">
            <Inbox className="size-4" aria-hidden />
            New applications
            {awaiting > 0 && (
              <span className="ml-1 rounded-full bg-secondary px-1.5 py-0.5 text-xs font-semibold text-secondary-foreground tabular-nums">
                {awaiting}
              </span>
            )}
          </Link>
        </Button>
      </div>

      {query.data?.cursor.hasMore ? (
        <p className="rounded-md border border-warning/40 bg-warning/10 px-4 py-2 text-sm">
          Showing the first 100 merchants — this screen needs its server-side
          paging turned on now the platform has outgrown one page. The summary
          tiles are hidden because they could no longer count everyone.
        </p>
      ) : (
        // Derived from the full set, so they cannot lie; one page holds everyone.
        <StatTiles merchants={merchants} loading={query.isLoading} />
      )}

      <DataTable
        columns={columns}
        data={merchants}
        loading={query.isLoading}
        toolbar={(table) => <Toolbar table={table} />}
        footer={(table) => <DataTablePagination table={table} />}
      />
    </section>
  );
}
