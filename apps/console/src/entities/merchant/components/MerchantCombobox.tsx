import { useInfiniteQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@gridcore/ui/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@gridcore/ui/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@gridcore/ui/components/ui/popover";

import { listMerchantDirectory } from "../api";

export interface MerchantChoice {
  id: string;
  name: string;
}

/**
 * The merchant picker: a combobox over the server's lightweight directory —
 * id and name only, searched and paged on the backend, so it holds up however
 * many merchants exist. The Command filters nothing itself.
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

  const merchants = query.data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value ? value.name : "Choose a merchant…"}
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search merchants…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {query.isFetching ? "Searching…" : "No merchant matches."}
            </CommandEmpty>
            {merchants.map((merchant) => (
              <CommandItem
                key={merchant.id}
                value={merchant.id}
                onSelect={() => {
                  onChange(merchant.id === value?.id ? null : merchant);
                  setOpen(false);
                }}
              >
                <Check
                  className={
                    merchant.id === value?.id
                      ? "size-4 text-secondary-foreground"
                      : "size-4 opacity-0"
                  }
                />
                {merchant.name}
              </CommandItem>
            ))}
            {query.hasNextPage ? (
              <CommandItem
                value="__more"
                onSelect={() => void query.fetchNextPage()}
                className="justify-center text-muted-foreground"
              >
                {query.isFetchingNextPage ? "Loading…" : "Load more"}
              </CommandItem>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
