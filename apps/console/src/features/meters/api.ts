import axiosInstance from "@/utils/axios-instance";

import type { MeterListPage, meterPowerArgs } from "./types";

/** The v2 fleet list — cursor-paginated, scope-dispatched on the server. */
export const listMeters = async (params: {
  search?: string;
  after?: string;
  pageSize?: number;
}) =>
  (
    await axiosInstance.get<MeterListPage>("/v1/meters", {
      params: {
        search: params.search || undefined,
        after: params.after || undefined,
        pageSize: params.pageSize,
      },
    })
  ).data;

// ---- custody (blueprint 47): the writes are premises', the screen is ours ----

/** Refuses a held meter — reassign is the deliberate act. */
export const assignMeter = async (meterId: string, customerId: string) =>
  axiosInstance.post<void>(`/v1/meters/${meterId}/assignment`, { customerId });

/** Closes the open span and opens the new one — history, never overwrite. */
export const reassignMeter = async (meterId: string, customerId: string) =>
  axiosInstance.put<void>(`/v1/meters/${meterId}/assignment`, { customerId });

export const unassignMeter = async (meterId: string) =>
  axiosInstance.delete<void>(`/v1/meters/${meterId}/assignment`);

export interface CustodyEntry {
  customerId: string;
  customerName: string;
  /** Backfilled spans carry the legacy registration date as a stated proxy. */
  assignedFrom: string;
  /** Null is the current holder. */
  assignedUntil?: string | null;
}

export const listMeterAssignments = async (meterId: string) =>
  (await axiosInstance.get<{ data: CustodyEntry[] }>(`/v1/meters/${meterId}/assignments`)).data;

// ---- legacy calls below — they 404 until their surfaces port (D-051) ----

export const postMeterPower = async (data: meterPowerArgs) => {
  const res = await axiosInstance.post("api-merchant/meter/power-control", {
    meterNumber: data.meterId,
    status: data.status,
  });
  return res.data;
};

export const getMeterReadings = async (id: string, brand: string) => {
  const url =
    brand === "LORA"
      ? `/meters/concentrator-online-status/${id}`
      : `/meters/gprs-online-status/${id}`;
  const response = await axiosInstance.get(url);
  return brand === "LORA"
    ? response.data.data.result.data[0].status
    : response.data.data.result.data[0].isOnline;
};

export const gethMeterAnalytics = async (meterId: string) => {
  const response = await axiosInstance.get(`/meters/analytics/${meterId}`);
  return response.data;
};

export const refreshMeterAnalytics = async (meterId: string) => {
  const response = await axiosInstance.post(
    `/meters/analytics/${meterId}/refresh/`
  );
  return response.data.data.meter.latestReading;
};
