import React from "react";

import clsx from "clsx";
import type { DayButton } from "react-day-picker";

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <button
      ref={ref}
      data-selected={modifiers.selected}
      data-range-start={modifiers.range_start}
      data-range-middle={modifiers.range_middle}
      data-range-end={modifiers.range_end}
      className={clsx(
        "h-9 w-9 mx-auto rounded-md text-sm flex items-center justify-center transition",
        "hover:bg-zinc-100",
        "data-[selected=true]:bg-primary data-[selected=true]:text-white",
        "data-[range-middle=true]:bg-primary data-[range-middle=true]:text-white data-[range-middle=true]:rounded-l-md data-[range-middle=true]:rounded-r-md",
        "data-[range-start=true]:rounded-l-md data-[range-end=true]:rounded-r-md",
        className
      )}
      {...props}
    >
      {day.date.getDate()}
    </button>
  );
}

export default CalendarDayButton;
