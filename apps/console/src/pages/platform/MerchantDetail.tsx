import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { MerchantRecord, MerchantRecordSkeleton } from "@/entities/merchant";
import { getMerchant } from "@/features/merchants";

/**
 * The record `GET /v1/merchants/{id}` answers, and nothing else. The legacy
 * tabs — bank, team, sites, payments, wallet — return with their read models.
 */
export default function MerchantDetail() {
  const { id } = useParams();

  const query = useQuery({
    queryKey: ["merchants", id],
    queryFn: () => getMerchant(id ?? ""),
    enabled: Boolean(id),
    retry: false,
  });

  const merchant = query.data;

  return (
    <section className="flex max-w-4xl flex-col gap-6">
      <Link
        to="/merchants"
        className="inline-flex w-fit items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Merchants
      </Link>

      {query.isLoading ? (
        <MerchantRecordSkeleton />
      ) : !merchant ? (
        // 401, 403 and 404 answer identically by design, so one block covers them.
        <div className="flex flex-col items-start gap-2 rounded-xl border border-border bg-card p-6">
          <p className="text-sm font-medium text-foreground">
            This merchant could not be loaded.
          </p>
          <p className="text-sm text-muted-foreground">
            It may not exist, or the record is not reachable from this session.
          </p>
        </div>
      ) : (
        <MerchantRecord merchant={merchant} />
      )}
    </section>
  );
}
