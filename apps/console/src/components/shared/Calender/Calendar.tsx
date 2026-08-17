import * as React from "react";

import clsx from "clsx";
import {
  DayPicker,
  type DayPickerProps,
  getDefaultClassNames,
} from "react-day-picker";

import CalendarDayButton from "./CalendarDayButton";
import CalendarNav from "./CalendarNav";

type CalendarProps = DayPickerProps;

export function Calendar({
  className,
  classNames,
  components,
  captionLayout = "dropdown",
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays
      captionLayout={captionLayout}
      className={clsx(
        "bg-white group/calendar p-3 [--cell-size:--spacing(8)] rounded-xl shadow-md",
        className
      )}
      classNames={{
        root: clsx("w-fit", defaultClassNames.root),
        months: "flex justify-center",
        month: "flex flex-col w-[280px] gap-3",
        month_caption: clsx(
          "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: clsx(
          "w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5",
          defaultClassNames.dropdowns
        ),
        dropdown_root: clsx(
          "relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md",
          defaultClassNames.dropdown_root
        ),
        dropdown: clsx(
          "absolute bg-popover inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        nav: clsx(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
          defaultClassNames.nav
        ),
        caption_label: clsx(
          "select-none font-medium",
          captionLayout === "label"
            ? "text-sm"
            : "rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        caption: "relative flex items-center justify-center",
        table: "w-full border-collapse",
        weekdays: "flex",
        weekday: "flex-1 text-center text-xs font-medium text-zinc-500",
        week: "flex w-full mt-1",
        day: clsx("relative flex-1 aspect-square select-none"),
        outside: "text-zinc-400 opacity-50",
        disabled: "opacity-50",
        hidden: clsx("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        DayButton: CalendarDayButton,
        Nav: CalendarNav,
        ...components,
      }}
      {...props}
    />
  );
}
