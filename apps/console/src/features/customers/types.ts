/** `GET /v1/customers` — the v2 contract (blueprint 40). */
export type CustomerStatus = "ACTIVE" | "BANNED";

export interface CustomerListItem {
  id: string;
  /** Absent for an offline customer (D-064) — no person exists. */
  firstName?: string | null;
  lastName?: string | null;
  /** Absent for an offline customer — the merchant reaches them off-platform. */
  phone?: string | null;
  email?: string | null;
  /** The merchant's own label for an offline customer. */
  displayName?: string | null;
  /** Conduct, not tenure — a closed edge is not in the list at all. */
  status: CustomerStatus;
  merchantName: string;
  siteName?: string | null;
  meterCount: number;
}

type Nameable = Pick<CustomerListItem, "firstName" | "lastName" | "displayName">;

/** The one place the name rule lives: a person's name, else the merchant's label. */
export function customerName(c: Nameable): string {
  if (c.firstName || c.lastName) return [c.firstName, c.lastName].filter(Boolean).join(" ");
  return c.displayName ?? "";
}

/** No person means vended for by hand and reached outside the platform. */
export function isOffline(c: Nameable): boolean {
  return !c.firstName && !c.lastName && Boolean(c.displayName);
}

export interface CustomerListPage {
  data: CustomerListItem[];
  cursor: { next?: string; hasMore: boolean };
}

/** A meter as the detail answers it — deliberately no meter id (D-062). */
export interface CustomerMeter {
  meterNumber: string;
  address?: string | null;
  commodity: string;
  comms: string;
  tariffIndex: number;
  /** Effective: the meter's custom rate, else its site default. */
  tariffRateMinor?: number | null;
  siteName?: string | null;
  assignedFrom: string;
}

/** `GET /v1/customers/{id}` — one response paints the screen (blueprint 45). */
export interface CustomerDetail {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  displayName?: string | null;
  status: CustomerStatus;
  merchantName: string;
  siteName?: string | null;
  /** Backfilled rows carry the legacy date as a stated proxy. */
  createdAt: string;
  /** False offers the attach path — no portal login exists yet. */
  hasAccount: boolean;
  meters: CustomerMeter[];
}
