import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDayPicker } from "react-day-picker";

function CalendarNav() {
  const { previousMonth, nextMonth, goToMonth } = useDayPicker();

  return (
    <div className="absolute inset-x-4 top-4 flex items-center justify-between">
      <button
        type="button"
        disabled={!previousMonth}
        onClick={() => previousMonth && goToMonth(previousMonth)}
        className="h-7 w-7 rounded-md flex items-center justify-center
                     text-muted-foreground hover:text-foreground
                   disabled:opacity-40 hover:bg-zinc-100"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <button
        type="button"
        disabled={!nextMonth}
        onClick={() => nextMonth && goToMonth(nextMonth)}
        className="h-7 w-7 rounded-md flex items-center justify-center
                   text-muted-foreground hover:text-foreground
                   disabled:opacity-40 hover:bg-zinc-100"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export default CalendarNav;
