import axiosInstance from "@/utils/axios-instance";

/** The writes of blueprint 46; the list lives in entities/site. */
export const createSite = async (body: {
  merchantId?: string;
  name: string;
  address: string;
  tariffRateMinor: number;
  tariffIndex?: number | null;
}) => (await axiosInstance.post<{ id: string }>("/v1/sites", body)).data;

export const updateSite = async (siteId: string, body: { name: string; address: string }) =>
  axiosInstance.patch<void>(`/v1/sites/${siteId}`, body);

/** M9: every meter still ON the default follows; custom-priced ones never move. */
export const reviseSiteTariff = async (
  siteId: string,
  body: { tariffRateMinor: number; tariffIndex?: number | null },
) => axiosInstance.post<void>(`/v1/sites/${siteId}/tariff`, body);

/** Refused for the default site and while anything living references it. */
export const deleteSite = async (siteId: string) =>
  axiosInstance.delete<void>(`/v1/sites/${siteId}`);
