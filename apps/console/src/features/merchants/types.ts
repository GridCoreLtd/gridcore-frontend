import type { Merchant } from "@/entities/merchant";

/** The record type lives in `entities/merchant` now — two features need it. */
export type { Merchant };

export interface MerchantListPage {
  data: Merchant[];
  cursor: { next?: string; hasMore: boolean };
}
