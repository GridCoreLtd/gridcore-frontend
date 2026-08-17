import { useQuery } from "@tanstack/react-query";

import { MerchantRecord, MerchantRecordSkeleton } from "@/entities/merchant";
import { getOwnMerchant } from "@/features/account-settings";

/**
 * The merchant's own record — the first merchant-audience screen on v2. The
 * legacy tabs — editing, bank, team, payments, sites, payout schedule — return
 * with their write surfaces and read models.
 */
export default function AccountSettings() {
  const query = useQuery({
    queryKey: ["merchant", "own"],
    queryFn: getOwnMerchant,
    retry: false,
  });

  const merchant = query.data;

  return (
    <section className="flex max-w-4xl flex-col gap-6">
      <p className="-mt-4 text-sm text-muted-foreground">
        Your business, as the platform has it on record.
      </p>

      {query.isLoading ? (
        <MerchantRecordSkeleton />
      ) : !merchant ? (
        <div className="flex flex-col items-start gap-2 rounded-xl border border-border bg-card p-6">
          <p className="text-sm font-medium text-foreground">
            Your record could not be loaded.
          </p>
          <p className="text-sm text-muted-foreground">
            This screen belongs to a merchant session. Refresh to try again.
          </p>
        </div>
      ) : (
        <MerchantRecord merchant={merchant} />
      )}
    </section>
  );
}
