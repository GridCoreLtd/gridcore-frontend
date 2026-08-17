import axiosInstance from "@/utils/axios-instance";

import type { CustomerListPage, CustomerStatus } from "./types";

/**
 * The v2 customers list — cursor-paginated, scope-dispatched on the server.
 * The client never says which merchant's rows it wants (doc 11 §6); the
 * session decides.
 */
export const listCustomers = async (params: {
  search?: string;
  status?: CustomerStatus | "";
  after?: string;
  pageSize?: number;
}) =>
  (
    await axiosInstance.get<CustomerListPage>("/v1/customers", {
      params: {
        search: params.search || undefined,
        status: params.status || undefined,
        after: params.after || undefined,
        pageSize: params.pageSize,
      },
    })
  ).data;
