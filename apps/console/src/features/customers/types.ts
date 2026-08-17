/** `GET /v1/customers` — the v2 contract (blueprint 40). */
export type CustomerStatus = "ACTIVE" | "BANNED";

export interface CustomerListItem {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  /** Conduct, not tenure — a closed edge is not in the list at all. */
  status: CustomerStatus;
  merchantName: string;
  siteName?: string | null;
  meterCount: number;
}

export interface CustomerListPage {
  data: CustomerListItem[];
  cursor: { next?: string; hasMore: boolean };
}
