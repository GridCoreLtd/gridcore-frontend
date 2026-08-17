import axiosInstance from "@/utils/axios-instance";

import type { Merchant, MerchantListPage } from "./types";

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

export const getMerchant = async (id: string) =>
  (await axiosInstance.get<Merchant>(`/v1/merchants/${id}`)).data;
