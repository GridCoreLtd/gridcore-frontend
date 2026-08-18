import { useEffect, useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, MoreHorizontal, Plus, Search, X } from "lucide-react";

import { parseApiError, toastMessage } from "@gridcore/api-client";
import { toast } from "sonner";

import { DataTable } from "@gridcore/ui/components/data-table";
import { Badge } from "@gridcore/ui/components/ui/badge";
import { Button } from "@gridcore/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@gridcore/ui/components/ui/dropdown-menu";
import { Input } from "@gridcore/ui/components/ui/input";
import { formatCurrency } from "@gridcore/ui/lib/format";

import { useScopes } from "@/auth/useScopes";
import { listSites, type Site } from "@/entities/site";
import { deleteSite, ReviseTariffSheet, SiteSheet } from "@/features/sites";
import { dateFormatter } from "@/utils/formatters";

const PAGE_SIZE = 25;

/**
 * The sites list (blueprint 46), cursor mode over (name, id). The counts are
 * the delete rule's forewarning: a referenced site or the default refuses.
 */
export default function Sites() {
  const { scopes } = useScopes();
  const isPlatform = scopes.includes("platform");
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState<Site | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [revising, setRevising] = useState<Site | null>(null);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [stack, setStack] = useState<string[]>([]);
  const after = stack[stack.length - 1] ?? "";

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(input);
      setStack([]);
    }, 300);
    return () => clearTimeout(timer);
  }, [input]);

  const query = useQuery({
    queryKey: ["sites", { search, after }],
    queryFn: () => listSites({ search, after, pageSize: PAGE_SIZE }),
    keepPreviousData: true,
  });

  const remove = useMutation({
    mutationFn: (site: Site) => deleteSite(site.id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["sites"] }),
    // Nothing attaches to a field on a row action; the refusal toasts.
    onError: (err) => toast.error(toastMessage(parseApiError(err))),
  });

  const columns = useMemo<ColumnDef<Site>[]>(() => {
    const base: ColumnDef<Site>[] = [
      {
        id: "name",
        header: "Site",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="flex items-center gap-2 truncate font-medium text-foreground">
              {row.original.name}
              {row.original.isDefault ? <Badge variant="secondary">Default</Badge> : null}
            </p>
            <p className="truncate text-xs text-muted-foreground">{row.original.address}</p>
          </div>
        ),
      },
      {
        accessorKey: "tariffRateMinor",
        header: "Default rate",
        cell: ({ row }) => (
          <span className="tabular-nums">
            {formatCurrency({ amount: row.original.tariffRateMinor / 100 })} / unit
          </span>
        ),
      },
      {
        accessorKey: "customerCount",
        header: "Customers",
        cell: ({ row }) =>
          row.original.customerCount === 0 ? (
            <span className="text-muted-foreground">None</span>
          ) : (
            <span className="tabular-nums">{row.original.customerCount}</span>
          ),
      },
      {
        accessorKey: "meterCount",
        header: "Meters",
        cell: ({ row }) =>
          row.original.meterCount === 0 ? (
            <span className="text-muted-foreground">None</span>
          ) : (
            <span className="tabular-nums">{row.original.meterCount}</span>
          ),
      },
      {
        accessorKey: "createdAt",
        header: "Added",
        cell: ({ row }) => dateFormatter.format(new Date(row.original.createdAt)),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Site actions">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => {
                  setEditing(row.original);
                  setSheetOpen(true);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setRevising(row.original)}>
                Revise tariff
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                disabled={
                  row.original.isDefault ||
                  row.original.customerCount > 0 ||
                  row.original.meterCount > 0
                }
                onSelect={() => remove.mutate(row.original)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ];
    if (isPlatform) {
      base.splice(1, 0, {
        accessorKey: "merchantName",
        header: "Merchant",
        cell: ({ row }) => row.original.merchantName,
      });
    }
    return base;
  }, [isPlatform, remove]);

  const page = stack.length + 1;
  const rows = query.data?.data ?? [];

  return (
    <section className="flex flex-col gap-5">
      <div className="-mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {isPlatform
            ? "Every site on the platform, across every merchant."
            : "The places you vend at, and the tariff new meters fall back to."}
        </p>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setSheetOpen(true);
          }}
        >
          <Plus className="size-4" />
          Add site
        </Button>
      </div>
      <SiteSheet site={editing} open={sheetOpen} onOpenChange={setSheetOpen} />
      <ReviseTariffSheet
        site={revising}
        open={revising !== null}
        onOpenChange={(next) => {
          if (!next) setRevising(null);
        }}
      />

      <DataTable
        columns={columns}
        data={rows}
        loading={query.isLoading}
        manual
        toolbar={() => (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                placeholder="Search sites…"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="h-9 w-60 bg-card pl-8 lg:w-80"
              />
            </div>
            {input && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => {
                  setInput("");
                  setStack([]);
                }}
              >
                Reset
                <X className="size-3.5" />
              </Button>
            )}
          </div>
        )}
        footer={() => (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page}
              {rows.length > 0 && <> · {rows.length} sites</>}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={stack.length === 0 || query.isFetching}
                onClick={() => setStack(stack.slice(0, -1))}
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!query.data?.cursor.hasMore || query.isFetching}
                onClick={() => {
                  const next = query.data?.cursor.next;
                  if (next) setStack([...stack, next]);
                }}
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      />
    </section>
  );
}
