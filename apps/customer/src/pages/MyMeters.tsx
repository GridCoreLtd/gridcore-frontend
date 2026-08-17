import { useQuery } from "@tanstack/react-query";
import { Gauge } from "lucide-react";

import { Badge } from "@gridcore/ui/components/ui/badge";

import SectionLoader from "@/components/shared/SectionLoader";
import { getMyMeters } from "@/features/meters";
import { usePageTitle } from "@/hooks/usePageTitle";

const since = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

/**
 * The first ported portal screen (blueprint 33): the person's own meters as
 * cards — a customer holds a handful, and reads this on a phone. Readings
 * arrive with the snapshot surface; until then the card states what is known.
 */
export default function MyMeters() {
  usePageTitle("My meters");
  const { data: meters, isLoading } = useQuery({
    queryKey: ["my-meters"],
    queryFn: getMyMeters,
  });

  return (
    <div className="flex flex-col gap-6 px-8 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">My meters</h1>
        <p className="text-sm text-muted-foreground">
          Every meter currently registered to you.
        </p>
      </div>

      {isLoading ? (
        <SectionLoader />
      ) : !meters?.length ? (
        <div className="flex max-w-md flex-col items-start gap-1 rounded-2xl border border-border p-6">
          <p className="font-medium text-primary">No meters yet</p>
          <p className="text-sm text-muted-foreground">
            Your provider registers meters to your account — contact them if one
            is missing here.
          </p>
        </div>
      ) : (
        <ul className="grid max-w-3xl gap-4 sm:grid-cols-2">
          {meters.map((meter) => (
            <li
              key={meter.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/5 text-primary">
                  <Gauge className="size-4.5" aria-hidden />
                </span>
                <Badge variant="secondary">{meter.commodity}</Badge>
              </div>

              <p className="font-mono text-lg font-semibold tracking-wide text-primary">
                {meter.meterNumber}
              </p>

              <div className="flex flex-col gap-0.5 text-sm text-muted-foreground">
                {(meter.siteName ?? meter.address) && (
                  <p>{meter.siteName ?? meter.address}</p>
                )}
                <p>Yours since {since(meter.assignedSince)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
