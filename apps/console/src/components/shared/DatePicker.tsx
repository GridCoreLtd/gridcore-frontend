import clsx from "clsx";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@gridcore/ui/components/ui/popover";

import { Calendar } from "./Calender/Calendar";


interface DatePickerBaseProps {
  placeholderText?: string;
  className?: string;
}

interface DatePickerSingleProps extends DatePickerBaseProps {
  mode: "single";
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
}

interface DatePickerRangeProps extends DatePickerBaseProps {
  mode: "range";
  selected?: DateRange;
  onSelect?: (date: DateRange | undefined) => void;
}

export function DatePicker(props: DatePickerSingleProps): JSX.Element;
export function DatePicker(props: DatePickerRangeProps): JSX.Element;
export function DatePicker(
  props: DatePickerSingleProps | DatePickerRangeProps
): JSX.Element {
  const {
    mode,
    selected,
    onSelect,
    placeholderText = "Pick a date",
    className,
  } = props;

  const displayValue = (() => {
    if (!selected) return null;

    if (mode === "range") {
      const range = selected as DateRange;
      if (range.from && range.to) {
        return `${format(range.from, "MMM dd, yyyy")} – ${format(
          range.to,
          "MMM dd, yyyy"
        )}`;
      }
      if (range.from) {
        return format(range.from, "MMM dd, yyyy");
      }
    }

    if (mode === "single") {
      return format(selected as Date, "MMM dd, yyyy");
    }

    return null;
  })();

  return (
    <Popover>
      <PopoverTrigger
        className={clsx(
          "inline-flex h-10 min-w-[240px] items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-xs transition",
          "hover:bg-zinc-50 focus:outline-hidden focus:ring-2 focus:ring-zinc-900/20",
          className
        )}
      >
        <CalendarIcon className="h-4 w-4 text-zinc-500" />
        <span className={clsx(!displayValue && "text-zinc-400")}>
          {displayValue || placeholderText}
        </span>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto p-0">
        {mode === "single" ? (
          <Calendar
            mode="single"
            selected={selected as Date}
            onSelect={onSelect as (date: Date | undefined) => void}
          />
        ) : (
          <Calendar
            mode="range"
            selected={selected as DateRange}
            onSelect={onSelect as (date: DateRange | undefined) => void}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
