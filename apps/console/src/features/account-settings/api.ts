import type { Merchant } from "@/entities/merchant";
import axiosInstance from "@/utils/axios-instance";

/** Resolved from the session — no id in the URL to probe. Platform answers 403. */
export const getOwnMerchant = async () =>
  (await axiosInstance.get<Merchant>("/v1/merchant")).data;
