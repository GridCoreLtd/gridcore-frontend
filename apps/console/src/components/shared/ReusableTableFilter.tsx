import { useState } from "react";
import type React from "react";

import classNames from "classnames";
import { Filter } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@gridcore/ui/components/ui/popover";

import type { FilterConfig } from "./reusable-filter/FilterInputFactories";
import {
  FilterSelectInput,
  FilterTextInput,
} from "./reusable-filter/FilterInputFactories";

interface ReusableTableFilterProps {
  filters: FilterConfig[];
  initialValues?: Record<string, any>;
  onApply: (values: Record<string, any>) => void;
  onReset?: () => void;
}

const ReusableTableFilter: React.FC<ReusableTableFilterProps> = ({
  filters,
  initialValues = {},
  onApply,
  onReset,
}) => {
  // Radix has no render-prop for open/close, so the panel is controlled here:
  // the trigger styling needs `open`, and applying a filter must dismiss it.
  const [open, setOpen] = useState(false);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: initialValues,
  });

  const onSubmit = (data: Record<string, any>) => {
    // Filter out empty values or undefined
    const cleanData = Object.entries(data).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== "" && value !== null) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, any>
    );
    onApply(cleanData);
  };

  const handleReset = () => {
    reset({}); // Reset form state
    if (onReset) {
      onReset();
    } else {
      // If no explicit reset handler, apply empty filters
      onApply({});
    }
  };

  // Helper to get active filter count for badge
  const activeFilterCount = Object.values(initialValues).filter(
    (val) => val !== undefined && val !== "" && val !== null
  ).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={classNames(
          "inline-flex items-center gap-x-2 rounded-md px-4 py-2 text-sm font-semibold shadow-xs ring-1 ring-inset relative",
          open
            ? "bg-gray-100 ring-gray-300"
            : "bg-white text-gray-900 ring-gray-300 hover:bg-gray-50",
          activeFilterCount > 0 ? "text-primary ring-0 bg-secondary/10" : ""
        )}
      >
        <Filter className="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
        Filter
        {activeFilterCount > 0 && (
          <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-primary bg-secondary rounded-full absolute -top-1 -right-1">
            {activeFilterCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-screen max-w-[calc(100vw-2rem)] overflow-hidden p-0 sm:max-w-sm lg:max-w-md"
      >
        <div className="relative bg-white p-6 grid gap-6">
          <div className="text-sm font-medium text-gray-900 border-b pb-2 mb-2">
            Filter Options
          </div>
          <form
            id="filter-form"
            onSubmit={(e) => {
              handleSubmit((data) => {
                onSubmit(data);
                setOpen(false);
              })(e);
            }}
            className="grid gap-4"
          >
            {filters.map((filter) => (
              <div key={filter.key}>
                {filter.type === "select" && (
                  <FilterSelectInput filter={filter} control={control} />
                )}
                {filter.type === "text" && (
                  <FilterTextInput filter={filter} control={control} />
                )}
                {/* Add other types as needed */}
              </div>
            ))}
          </form>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              handleReset();
              setOpen(false);
            }}
            className="text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            Reset Defaults
          </button>
          <button
            type="submit"
            form="filter-form"
            className="rounded-md bg-secondary px-3.5 py-2.5 text-sm font-semibold text-primary shadow-xs hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
          >
            Apply Filter
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ReusableTableFilter;
