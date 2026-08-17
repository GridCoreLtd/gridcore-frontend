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
