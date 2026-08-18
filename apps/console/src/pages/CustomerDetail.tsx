import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Plus } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Badge } from "@gridcore/ui/components/ui/badge";
import { Button } from "@gridcore/ui/components/ui/button";
import { Skeleton } from "@gridcore/ui/components/ui/skeleton";
import { formatCurrency } from "@gridcore/ui/lib/format";

import { useScopes } from "@/auth/useScopes";
import { AttachPersonSheet, customerName, getCustomer, isOffline } from "@/features/customers";
import { dateFormatter, initials } from "@/utils/formatters";

import type { CustomerDetail as Detail, CustomerMeter } from "@/features/customers";
/**
 * The record `GET /v1/customers/{id}` answers, and nothing else. The legacy
 * tabs — transactions, top-ups, wallet — return with their read models.
 */
export default function CustomerDetail() {
  const { id } = useParams();
  const [attaching, setAttaching] = useState(false);

  const query = useQuery({
    queryKey: ["customers", id],
    queryFn: () => getCustomer(id ?? ""),
    enabled: Boolean(id),
    retry: false,
  });

  const customer = query.data;

  return (
    <section className="flex max-w-4xl flex-col gap-6">
      <Link
        to="/customers"
        className="inline-flex w-fit items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Customers
      </Link>

      {query.isLoading ? (
        <CustomerRecordSkeleton />
      ) : !customer ? (
        // 401, 403 and 404 answer identically by design, so one block covers them.
        <div className="flex flex-col items-start gap-2 rounded-xl border border-border bg-card p-6">
          <p className="text-sm font-medium text-foreground">
            This customer could not be loaded.
          </p>
          <p className="text-sm text-muted-foreground">
            They may not exist, or the record is not reachable from this session.
          </p>
        </div>
      ) : (
        <>
          <CustomerRecord customer={customer} onAttach={() => setAttaching(true)} />
          <AttachPersonSheet
            customerId={customer.id}
            customerName={customerName(customer)}
            open={attaching}
            onOpenChange={setAttaching}
          />
        </>
      )}
    </section>
  );
}

function CustomerRecord({
  customer,
  onAttach,
}: {
  customer: Detail;
  onAttach: () => void;
}) {
  const { isPlatform } = useScopes();
  const offline = isOffline(customer);
  const name = customerName(customer);

  return (
    <>
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-6">
        <span
          aria-hidden
          className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary text-xl font-semibold text-primary-foreground"
        >
          {initials(name)}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
            {name}
          </h1>
          <p className="truncate text-sm text-muted-foreground">
            {isPlatform ? `${customer.merchantName} · ` : ""}
            Customer since {dateFormatter.format(new Date(customer.createdAt))}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {customer.status === "BANNED" ? <Badge variant="destructive">Banned</Badge> : null}
          {customer.siteName ? <Badge variant="secondary">{customer.siteName}</Badge> : null}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-base font-semibold text-foreground">Contact</h2>
          {offline ? (
            <Button size="sm" onClick={onAttach}>
              <Plus className="size-4" aria-hidden />
              Add contact details
            </Button>
          ) : null}
        </div>
        {offline ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Offline — no contact details. This customer is vended for by hand and reached
            outside the platform; adding a phone lets them claim a portal login.
          </p>
        ) : (
          <dl className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Phone
              </dt>
              <dd className="mt-1 text-sm text-foreground">{customer.phone}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Email
              </dt>
              <dd className="mt-1 text-sm text-foreground">{customer.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Portal access
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                {customer.hasAccount
                  ? "Can sign in on the merchant portal"
                  : "No portal login yet"}
              </dd>
            </div>
          </dl>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground">Meters</h2>
        {customer.meters.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No meter is assigned. A new customer&apos;s meter is registered from the
            customers list; an existing meter is assigned from the Meters screen.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {customer.meters.map((meter) => (
              <MeterCard key={meter.meterNumber} meter={meter} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function MeterCard({ meter }: { meter: CustomerMeter }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-sm font-semibold text-foreground">
          {meter.meterNumber}
        </span>
        <Badge variant="muted">
          {meter.commodity.charAt(0) + meter.commodity.slice(1).toLowerCase()}
          {meter.comms !== "NONE" ? ` · ${meter.comms}` : ""}
        </Badge>
      </div>
      <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground">Rate</dt>
          <dd className="text-foreground">
            {meter.tariffRateMinor != null
              ? `${formatCurrency({ amount: meter.tariffRateMinor / 100 })} / unit`
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Tariff index</dt>
          <dd className="text-foreground">{meter.tariffIndex}</dd>
        </div>
        {meter.address ? (
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">Address</dt>
            <dd className="text-foreground">{meter.address}</dd>
          </div>
        ) : null}
        <div className="sm:col-span-2">
          <dt className="text-xs text-muted-foreground">Assigned</dt>
          <dd className="text-foreground">
            {dateFormatter.format(new Date(meter.assignedFrom))}
            {meter.siteName ? ` · ${meter.siteName}` : ""}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function CustomerRecordSkeleton() {
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
      {[0, 1].map((i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {[0, 1, 2, 3].map((j) => (
              <div key={j} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-48" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
