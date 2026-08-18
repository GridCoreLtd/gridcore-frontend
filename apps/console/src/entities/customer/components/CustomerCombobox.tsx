import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type * as React from "react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@gridcore/ui/components/ui/combobox";

import { choiceName, searchCustomers, type CustomerChoiceRow } from "../api";

export interface CustomerChoice {
  id: string;
  name: string;
}

/**
 * The customer picker — the fourth combobox, MerchantCombobox's shape over
 * GET /v1/customers. The server scopes: a merchant sees its own, platform
 * sees the adopted view.
 */
export default function CustomerCombobox({
  value,
  onChange,
}: {
  value: CustomerChoice | null;
  onChange: (customer: CustomerChoice | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  // Anchor on the field, portal into the Sheet's subtree — the two combobox
  // lessons, kept.
  const anchor = useComboboxAnchor();
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const query = useInfiniteQuery({
    queryKey: ["customer-choices", debounced],
    queryFn: ({ pageParam = "" }: { pageParam?: string }) =>
      searchCustomers({ search: debounced, after: pageParam, pageSize: 20 }),
    getNextPageParam: (last) => (last.cursor.hasMore ? last.cursor.next : undefined),
    enabled: open,
  });

  const customers: CustomerChoice[] =
    query.data?.pages.flatMap((page) =>
      page.data.map((row: CustomerChoiceRow) => ({ id: row.id, name: choiceName(row) })),
    ) ?? [];

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
  const onListScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    if (!hasNextPage || isFetchingNextPage) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 48) {
      void fetchNextPage();
    }
  };

  return (
    <Combobox
      items={customers}
      value={value}
      onValueChange={(next: CustomerChoice | null) => onChange(next)}
      open={open}
      onOpenChange={setOpen}
      inputValue={search}
      onInputValueChange={setSearch}
      itemToStringLabel={(customer: CustomerChoice) => customer.name}
      itemToStringValue={(customer: CustomerChoice) => customer.id}
      filter={null}
    >
      <div
        ref={(node) => {
          anchor.current = node;
          setContainer(node);
        }}
      >
        <ComboboxInput placeholder="Choose a customer…" showClear />
      </div>
      <ComboboxContent anchor={anchor} container={container} className="min-w-(--anchor-width)">
        <ComboboxEmpty>
          {query.isFetching ? "Searching…" : "No customer matches."}
        </ComboboxEmpty>
        <ComboboxList onScroll={onListScroll}>
          {(customer: CustomerChoice) => (
            <ComboboxItem key={customer.id} value={customer}>
              {customer.name}
            </ComboboxItem>
          )}
        </ComboboxList>
        {isFetchingNextPage ? (
          <div aria-hidden className="flex justify-center border-t py-1.5">
            <Loader2 className="size-4 animate-spin text-neutral-400" />
          </div>
        ) : null}
      </ComboboxContent>
    </Combobox>
  );
}
