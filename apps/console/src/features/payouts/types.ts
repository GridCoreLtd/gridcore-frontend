import type { Payout } from "@/entities/payout";

export type { Payout };

import { ColumnDef } from "@tanstack/react-table";


export interface PayoutsSummary {
  totalAmount: number;
  totalCount: number;
  successAmount: number;
  successCount: number;
  failedAmount: number;
  failedCount: number;
}

export interface PayoutListResponse {
  data: Payout[];
  meta: { total: number; lastPage: number; currentPage: number; perPage: number };
}
