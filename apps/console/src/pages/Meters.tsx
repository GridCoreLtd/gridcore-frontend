import { useEffect, useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, MoreHorizontal, Search } from "lucide-react";

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
import { useScopes } from "@/auth/useScopes";
import {
  AssignMeterSheet,
  CustodyHistorySheet,
  listMeters,
  unassignMeter,
  type MeterListItem,
} from "@/features/meters";
import { dateFormatter } from "@/utils/formatters";

const PAGE_SIZE = 25;

/**
 * The fleet, in cursor mode (D-052): the server pages and orders, the screen
 * keeps a stack of the cursors it came through, and Previous pops it. No client
 * sorting or filtering — 2,305 rows never leave the server at once.
 */
export default function Meters() {
  const { scopes } = useScopes();
  const isPlatform = scopes.includes("platform");
  const queryClient = useQueryClient();

  // The custody drawers (blueprint 47): assigning targets a row, so the row
  // rides the state.
  const [assigning, setAssigning] = useState<MeterListItem | null>(null);
  const [history, setHistory] = useState<MeterListItem | null>(null);

  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
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
    queryKey: ["meters", { search, after }],
    queryFn: () => listMeters({ search, after, pageSize: PAGE_SIZE }),
    keepPreviousData: true,
  });

  const unassign = useMutation({
    mutationFn: (meter: MeterListItem) => unassignMeter(meter.id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["meters"] }),
    // Nothing attaches to a field on a row action; the refusal toasts.
    onError: (err) => toast.error(toastMessage(parseApiError(err))),
  });

  const columns = useMemo<ColumnDef<MeterListItem>[]>(() => {
    const base: ColumnDef<MeterListItem>[] = [
      {
        accessorKey: "meterNumber",
        header: "Meter number",
        cell: ({ row }) => (
          <span className="font-mono text-sm font-medium text-foreground">
            {row.original.meterNumber}
          </span>
        ),
      },
      {
        accessorKey: "customerName",
        header: "Customer",
        cell: ({ row }) =>
          row.original.customerName ? (
            <span>{row.original.customerName}</span>
          ) : (
            // No open assignment is a fact, not a gap (D-046).
            <span className="text-muted-foreground">Unassigned</span>
          ),
      },
      {
        accessorKey: "commodity",
        header: "Commodity",
        cell: ({ row }) => (
          <Badge variant="muted" className="capitalize">
            {row.original.commodity.toLowerCase()}
          </Badge>
        ),
      },
      {
        accessorKey: "comms",
        header: "Comms",
        cell: ({ row }) =>
          row.original.comms === "NONE" ? (
            <span className="text-muted-foreground">—</span>
          ) : (
            <Badge variant="secondary">{row.original.comms}</Badge>
          ),
      },
      {
        accessorKey: "siteName",
        header: "Site",
        cell: ({ row }) =>
          row.original.siteName ?? <span className="text-muted-foreground">—</span>,
      },
      {
        accessorKey: "createdAt",
        header: "Registered",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {dateFormatter.format(new Date(row.original.createdAt))}
          </span>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Meter actions">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {row.original.customerName ? (
                <>
                  <DropdownMenuItem onSelect={() => setAssigning(row.original)}>
                    Reassign
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={() => unassign.mutate(row.original)}
                  >
                    Unassign
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onSelect={() => setAssigning(row.original)}>
                  Assign
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={() => setHistory(row.original)}>
                View history
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ];
    if (isPlatform) {
      base.splice(2, 0, {
        accessorKey: "merchantName",
        header: "Merchant",
        cell: ({ row }) => row.original.merchantName,
      });
    }
    return base;
  }, [isPlatform, unassign]);

  const page = stack.length + 1;
  const rows = query.data?.data ?? [];

  return (
    <section className="flex flex-col gap-5">
      <p className="-mt-4 text-sm text-muted-foreground">
        {isPlatform
          ? "Every meter on the platform, across every merchant."
          : "Your fleet."}
      </p>
      <AssignMeterSheet
        meterId={assigning?.id ?? ""}
        meterNumber={assigning?.meterNumber ?? ""}
        currentHolder={assigning?.customerName ?? null}
        open={assigning !== null}
        onOpenChange={(next) => {
          if (!next) setAssigning(null);
        }}
      />
      <CustodyHistorySheet
        meterId={history?.id ?? ""}
        meterNumber={history?.meterNumber ?? ""}
        open={history !== null}
        onOpenChange={(next) => {
          if (!next) setHistory(null);
        }}
      />

      <DataTable
        columns={columns}
        data={rows}
        loading={query.isLoading}
        manual
        toolbar={() => (
          <div className="relative">
            <Search
              className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              placeholder="Search meter number…"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="h-9 w-60 bg-card pl-8 lg:w-72"
            />
          </div>
        )}
        footer={() => (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page}
              {rows.length > 0 && <> · {rows.length} meters</>}
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
