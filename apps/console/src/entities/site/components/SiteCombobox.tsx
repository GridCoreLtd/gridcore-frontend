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

import { listSites, type Site } from "../api";

export interface SiteChoice {
  id: string;
  name: string;
}

/**
 * The site picker — MerchantCombobox's shape over `GET /v1/sites`. A platform
 * session passes the chosen merchant's id; a merchant session passes nothing
 * and the server scopes to its own.
 */
export default function SiteCombobox({
  value,
  onChange,
  merchantId,
}: {
  value: SiteChoice | null;
  onChange: (site: SiteChoice | null) => void;
  merchantId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  // Anchor on the field, portal into the Sheet's subtree — MerchantCombobox's
  // two lessons, kept.
  const anchor = useComboboxAnchor();
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const query = useInfiniteQuery({
    queryKey: ["sites", { search: debounced, merchantId }],
    queryFn: ({ pageParam = "" }: { pageParam?: string }) =>
      listSites({ search: debounced, merchantId, after: pageParam, pageSize: 20 }),
    getNextPageParam: (last) => (last.cursor.hasMore ? last.cursor.next : undefined),
    enabled: open,
  });

  const sites = query.data?.pages.flatMap((page) => page.data) ?? [];

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
      items={sites}
      value={value}
      onValueChange={(next: SiteChoice | null) => onChange(next)}
      open={open}
      onOpenChange={setOpen}
      inputValue={search}
      onInputValueChange={setSearch}
      itemToStringLabel={(site: SiteChoice) => site.name}
      itemToStringValue={(site: SiteChoice) => site.id}
      filter={null}
    >
      <div
        ref={(node) => {
          anchor.current = node;
          setContainer(node);
        }}
      >
        <ComboboxInput placeholder="Choose a site…" showClear />
      </div>
      <ComboboxContent anchor={anchor} container={container} className="min-w-(--anchor-width)">
        <ComboboxEmpty>
          {query.isFetching ? "Searching…" : "No site matches."}
        </ComboboxEmpty>
        <ComboboxList onScroll={onListScroll}>
          {(site: Site) => (
            <ComboboxItem key={site.id} value={site}>
              {site.name}
              {site.isDefault ? (
                <span className="ml-2 text-xs text-muted-foreground">Default</span>
              ) : null}
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
