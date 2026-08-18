import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import Combobox from "@gridcore/ui/components/Combobox";

import { listMerchantDirectory } from "../api";

export interface MerchantChoice {
  id: string;
  name: string;
}

/**
 * The merchant picker: `@gridcore/ui`'s Combobox over the server's lightweight
 * directory — id and name only, searched and paged on the backend, so it holds
 * up however many merchants exist. This wrapper owns only the data.
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

  const items =
    query.data?.pages.flatMap((page) =>
      page.data.map((m) => ({ value: m.id, label: m.name })),
    ) ?? [];

  return (
    <Combobox
      items={items}
      value={value ? { value: value.id, label: value.name } : null}
      onChange={(item) => onChange(item ? { id: item.value, name: item.label } : null)}
      search={search}
      onSearchChange={setSearch}
      open={open}
      onOpenChange={setOpen}
      hasMore={query.hasNextPage ?? false}
      onLoadMore={() => void query.fetchNextPage()}
      loading={query.isFetching}
      placeholder="Choose a merchant…"
      searchPlaceholder="Search merchants…"
      emptyText="No merchant matches."
    />
  );
}
