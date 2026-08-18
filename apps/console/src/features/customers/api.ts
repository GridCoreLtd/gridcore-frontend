import axiosInstance from "@/utils/axios-instance";

import type { CustomerDetail, CustomerListPage, CustomerStatus } from "./types";

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
  merchantId?: string;
  siteId?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  displayName?: string;
  meter?: {
    meterNumber: string;
    address?: string;
    commodity: string;
    comms: string;
    tariffIndex: number;
    /** Omitted with a siteId: the meter rides the site default (Q3). */
    tariffRateMinor?: number;
  };
}) =>
  (await axiosInstance.post<{ id: string; meterId?: string | null }>("/v1/customers", body)).data;

/** Absent, closed and another merchant's answer one 404. */
export const getCustomer = async (id: string) =>
  (await axiosInstance.get<CustomerDetail>(`/v1/customers/${id}`)).data;

/**
 * The upgrade path (D-064): the offline customer finally has a reachable
 * phone. The edge keeps its id, meters and history, and the claim link goes
 * out by SMS — the same promise create makes, made later.
 */
export const attachPerson = async (
  customerId: string,
  body: { firstName: string; lastName: string; phone: string; email: string },
) => axiosInstance.post<void>(`/v1/customers/${customerId}/person`, body);
