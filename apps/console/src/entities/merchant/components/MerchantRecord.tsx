import { ExternalLink } from "lucide-react";

import { Badge } from "@gridcore/ui/components/ui/badge";
import { Skeleton } from "@gridcore/ui/components/ui/skeleton";
import { dateFormatter, initials } from "@/utils/formatters";

import type { Merchant } from "../types";

/**
 * The eight fields the v2 contract answers, rendered the same wherever a
 * merchant record appears — the operator's detail view and the merchant's own
 * account settings.
 */
export function MerchantRecord({ merchant }: { merchant: Merchant }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-6">
        <span
          aria-hidden
          className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary text-xl font-semibold text-primary-foreground"
        >
          {initials(merchant.name)}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
            {merchant.name}
          </h1>
          <p className="truncate text-sm text-muted-foreground">
            {merchant.shortBusinessName} · Merchant since{" "}
            {dateFormatter.format(new Date(merchant.createdAt))}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant="secondary">{merchant.country}</Badge>
          <Badge variant="muted">{merchant.currency}</Badge>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground">
          Business details
        </h2>
        <dl className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Address
            </dt>
            <dd className="mt-1 text-sm text-foreground">{merchant.address}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Website
            </dt>
            <dd className="mt-1 text-sm">
              {merchant.website ? (
                <a
                  href={merchant.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  {new URL(merchant.website).hostname}
                  <ExternalLink className="size-3" aria-hidden />
                </a>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Subdomain
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {merchant.shortBusinessName}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Since
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {dateFormatter.format(new Date(merchant.createdAt))}
            </dd>
          </div>
        </dl>
      </div>
    </>
  );
}

export function MerchantRecordSkeleton() {
  return (
    <>
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-6">
        <Skeleton className="size-16 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-48" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
