import { Check, ChevronsUpDown } from "lucide-react"
import * as React from "react"

import { Button } from "./ui/button"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

export interface ComboboxItem {
  value: string
  label: string
}

/**
 * shadcn's combobox recipe (Popover + Command — there is no registry component)
 * promoted to one place, in its server-filtered form: the caller owns the data
 * and the search state, this owns the widget. `Command` filters nothing itself,
 * because the backend already did.
 */
export default function Combobox({
  items,
  value,
  onChange,
  search,
  onSearchChange,
  open,
  onOpenChange,
  hasMore = false,
  onLoadMore,
  loading = false,
  placeholder = "Choose…",
  searchPlaceholder = "Search…",
  emptyText = "No match.",
}: {
  items: ComboboxItem[]
  value: ComboboxItem | null
  onChange: (item: ComboboxItem | null) => void
  search: string
  onSearchChange: (search: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  hasMore?: boolean
  onLoadMore?: () => void
  loading?: boolean
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value ? value.label : placeholder}
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={onSearchChange}
          />
          <CommandList>
            <CommandEmpty>{loading ? "Searching…" : emptyText}</CommandEmpty>
            {items.map((item) => (
              <CommandItem
                key={item.value}
                value={item.value}
                onSelect={() => {
                  onChange(item.value === value?.value ? null : item)
                  onOpenChange(false)
                }}
              >
                <Check
                  className={
                    item.value === value?.value
                      ? "size-4 text-secondary-foreground"
                      : "size-4 opacity-0"
                  }
                />
                {item.label}
              </CommandItem>
            ))}
            {hasMore && onLoadMore ? (
              <CommandItem
                value="__load_more"
                onSelect={onLoadMore}
                className="justify-center text-muted-foreground"
              >
                {loading ? "Loading…" : "Load more"}
              </CommandItem>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
