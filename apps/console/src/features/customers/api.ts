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

/**
 * One create, two shapes (D-064): contact details make a person and the
 * ordinary customer; a display name alone records an offline one. The server
 * refuses both-at-once and a contact that already belongs to someone.
 */
export const createCustomer = async (body: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  displayName?: string;
}) => (await axiosInstance.post<{ id: string }>("/v1/customers", body)).data;
