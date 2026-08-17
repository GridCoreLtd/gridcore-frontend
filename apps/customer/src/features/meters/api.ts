import axiosInstance from "@/utils/axios-instance";

import type { MyMeter } from "./types";

export const getMyMeters = async () =>
  (await axiosInstance.get<{ data: MyMeter[] }>("/v1/my/meters")).data.data;
