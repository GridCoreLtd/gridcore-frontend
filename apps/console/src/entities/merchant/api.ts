import axiosInstance from "@/utils/axios-instance";

import type { Merchant } from "./types";

export interface MerchantListPage {
  data: Merchant[];
  cursor: { next?: string; hasMore: boolean };
}

/**
 * The v2 merchants list. Lives at the entity layer because more than one
 * feature reads it (doc 11 §2: feature → entity, never feature → feature).
 */
export const listMerchants = async (params: {
  search?: string;
  after?: string;
  pageSize?: number;
}) =>
  (
    await axiosInstance.get<MerchantListPage>("/v1/merchants", {
      params: {
        search: params.search || undefined,
        after: params.after || undefined,
        pageSize: params.pageSize,
      },
    })
  ).data;
