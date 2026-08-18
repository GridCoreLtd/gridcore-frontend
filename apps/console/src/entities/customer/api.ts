import axiosInstance from "@/utils/axios-instance";

/**
 * The picker's feed (blueprint 47): the same GET /v1/customers, shaped for
 * search-and-pick. Lives at the entity layer because more than one feature
 * reaches for a customer (doc 11 §2).
 */
export interface CustomerChoiceRow {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  phone?: string | null;
}

export interface CustomerChoicePage {
  data: CustomerChoiceRow[];
  cursor: { next?: string; hasMore: boolean };
}

export const searchCustomers = async (params: {
  search?: string;
  after?: string;
  pageSize?: number;
}) =>
  (
    await axiosInstance.get<CustomerChoicePage>("/v1/customers", {
      params: {
        search: params.search || undefined,
        after: params.after || undefined,
        pageSize: params.pageSize,
      },
    })
  ).data;

/** The one name rule (D-064), entity-local: a person's name, else the label. */
export function choiceName(c: CustomerChoiceRow): string {
  if (c.firstName || c.lastName) return [c.firstName, c.lastName].filter(Boolean).join(" ");
  return c.displayName ?? "";
}
