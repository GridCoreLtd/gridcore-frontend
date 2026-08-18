import axiosInstance from "@/utils/axios-instance";

import type { Merchant, MerchantListPage } from "./types";

export { listMerchants } from "@/entities/merchant";

export const getMerchant = async (id: string) =>
  (await axiosInstance.get<Merchant>(`/v1/merchants/${id}`)).data;
