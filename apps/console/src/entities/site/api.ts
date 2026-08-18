import axiosInstance from "@/utils/axios-instance";

/** `GET /v1/sites` — blueprint 46. `isDefault` is D-065's flag, not a name. */
export interface Site {
  id: string;
  name: string;
  address: string;
  /** The default meters fall back to (Q3), minor units. */
  tariffRateMinor: number;
  tariffIndex?: number | null;
  isDefault: boolean;
  merchantName: string;
  /** Living references — the delete rule's forewarning. */
  customerCount: number;
  meterCount: number;
  createdAt: string;
}

export interface SiteListPage {
  data: Site[];
  cursor: { next?: string; hasMore: boolean };
}

/**
 * Lives at the entity layer because more than one feature reads it (doc 11
 * §2): the sites screen, and the customer drawer's picker.
 */
export const listSites = async (params: {
  search?: string;
  merchantId?: string;
  after?: string;
  pageSize?: number;
}) =>
  (
    await axiosInstance.get<SiteListPage>("/v1/sites", {
      params: {
        search: params.search || undefined,
        merchantId: params.merchantId || undefined,
        after: params.after || undefined,
        pageSize: params.pageSize,
      },
    })
  ).data;
