import { useEffect, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Plus, Search, X } from "lucide-react";
import { Link } from "react-router-dom";

import { DataTable } from "@gridcore/ui/components/data-table";
import { Badge } from "@gridcore/ui/components/ui/badge";
import { Button } from "@gridcore/ui/components/ui/button";
import { Input } from "@gridcore/ui/components/ui/input";

import { useScopes } from "@/auth/useScopes";
import {
  listCustomers,
  type CustomerListItem,
  customerName,
  isOffline,
  NewCustomerSheet,
  type CustomerStatus,
} from "@/features/customers";
import { initials } from "@/utils/formatters";

const PAGE_SIZE = 25;

/**
 * The customers list, in cursor mode (D-052): the server pages and orders by
 * name, the screen keeps a stack of the cursors it came through, and Previous
 * pops it. 1,482 rows never leave the server at once.
 *
 * Open edges only. `status` is conduct — a ban is the merchant's act against
 * their own customer — and is a separate axis from whether the edge is closed.
 */
export default function Customers() {
  const { scopes } = useScopes();
  const isPlatform = scopes.includes("platform");

  const [adding, setAdding] = useState(false);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CustomerStatus | "">("");
  // The cursors behind us; the last one is the page we are on. Empty = page one.
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
    queryKey: ["customers", { search, status, after }],
    queryFn: () => listCustomers({ search, status, after, pageSize: PAGE_SIZE }),
    keepPreviousData: true,
  });

  const columns = useMemo<ColumnDef<CustomerListItem>[]>(() => {
    const base: ColumnDef<CustomerListItem>[] = [
      {
        id: "name",
        header: "Customer",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/5 text-xs font-semibold text-primary"
            >
              {initials(customerName(row.original))}
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">
                {customerName(row.original)}
              </p>
              {isOffline(row.original) ? (
                // Vended for by hand; the merchant reaches them off-platform (D-064).
                <p className="truncate text-xs text-muted-foreground">Offline — no contact details</p>
              ) : (
                <p className="truncate font-mono text-xs text-muted-foreground">
                  {row.original.phone}
                </p>
              )}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "siteName",
        header: "Site",
        cell: ({ row }) =>
          row.original.siteName ?? <span className="text-muted-foreground">—</span>,
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
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) =>
          row.original.status === "BANNED" ? (
            // The merchant's own act against their own customer (D-053).
            <Badge variant="destructive">Banned</Badge>
          ) : (
            <Badge variant="muted">Active</Badge>
          ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <Link
            to={`/customers/${row.original.id}`}
            className="inline-flex items-center gap-0.5 text-sm font-medium text-primary hover:underline"
          >
            View
            <ChevronRight className="size-3.5" aria-hidden />
          </Link>
        ),
      },
    ];
    // Scope changes what renders, never which component loads (doc 11 §6).
    if (isPlatform) {
      base.splice(1, 0, {
        accessorKey: "merchantName",
        header: "Merchant",
        cell: ({ row }) => row.original.merchantName,
      });
    }
    return base;
  }, [isPlatform]);

  const page = stack.length + 1;
  const rows = query.data?.data ?? [];

  return (
    <section className="flex flex-col gap-5">
      <div className="-mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {isPlatform
            ? "Every customer on the platform, across every merchant."
            : "The people who buy from you."}
        </p>
        {/* The server refuses without customer.write; a platform session must
            have adopted a merchant, which is also the server's answer. */}
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus className="size-4" />
          Add customer
        </Button>
      </div>
      <NewCustomerSheet open={adding} onOpenChange={setAdding} />

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
                placeholder="Search name or phone…"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="h-9 w-60 bg-card pl-8 lg:w-80"
              />
            </div>
            <div className="flex gap-1 rounded-lg bg-primary/5 p-1">
              {(["", "ACTIVE", "BANNED"] as const).map((value) => (
                <button
                  key={value || "all"}
                  type="button"
                  onClick={() => {
                    setStatus(value);
                    setStack([]);
                  }}
                  className={
                    status === value
                      ? "rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground"
                      : "rounded-md px-3 py-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                  }
                >
                  {value === "" ? "All" : value === "ACTIVE" ? "Active" : "Banned"}
                </button>
              ))}
            </div>
            {(input || status) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => {
                  setInput("");
                  setStatus("");
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
              {rows.length > 0 && <> · {rows.length} customers</>}
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
