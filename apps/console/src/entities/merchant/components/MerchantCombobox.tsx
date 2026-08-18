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

import { listMerchantDirectory } from "../api";

export interface MerchantChoice {
  id: string;
  name: string;
}

/**
 * The merchant picker: shadcn's Combobox (Base UI) over the server's
 * lightweight directory — id and name only, searched and paged on the backend,
 * so it holds up however many merchants exist. `filter` is identity because
 * the server already filtered.
 */
export default function MerchantCombobox({
  value,
  onChange,
}: {
  value: MerchantChoice | null;
  onChange: (merchant: MerchantChoice | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  // Without an explicit anchor the popup positions off the chevron BUTTON
  // inside the input group — a sliver hugging the field's right edge. The same
  // div is the PORTAL container: inside the Sheet's subtree, so the modal's
  // scroll lock and focus trap leave the popup alone.
  const anchor = useComboboxAnchor();
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // react-query v4: the cursor rides pageParam, and undefined ends the walk.
  const query = useInfiniteQuery({
    queryKey: ["merchant-directory", debounced],
    queryFn: ({ pageParam = "" }: { pageParam?: string }) =>
      listMerchantDirectory({ search: debounced, after: pageParam, pageSize: 20 }),
    getNextPageParam: (last) => (last.cursor.hasMore ? last.cursor.next : undefined),
    enabled: open,
  });

  const merchants = query.data?.pages.flatMap((page) => page.data) ?? [];

  // The next page loads itself: nearing the list's bottom fetches it.
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
      items={merchants}
      value={value}
      onValueChange={(next: MerchantChoice | null) => onChange(next)}
      open={open}
      onOpenChange={setOpen}
      inputValue={search}
      onInputValueChange={setSearch}
      itemToStringLabel={(merchant: MerchantChoice) => merchant.name}
      itemToStringValue={(merchant: MerchantChoice) => merchant.id}
      filter={null}
    >
      <div
        ref={(node) => {
          anchor.current = node;
          setContainer(node);
        }}
      >
        <ComboboxInput placeholder="Choose a merchant…" showClear />
      </div>
      <ComboboxContent anchor={anchor} container={container} className="min-w-(--anchor-width)">
        <ComboboxEmpty>
          {query.isFetching ? "Searching…" : "No merchant matches."}
        </ComboboxEmpty>
        <ComboboxList onScroll={onListScroll}>
          {(merchant: MerchantChoice) => (
            <ComboboxItem key={merchant.id} value={merchant}>
              {merchant.name}
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
