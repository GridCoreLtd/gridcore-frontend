import axiosInstance from "@/utils/axios-instance";

import type { MfaSettings, TotpEnrolment } from "./types";

export const getMfaSettings = async () =>
  (await axiosInstance.get<MfaSettings>("/v1/mfa")).data;

/** The secret crosses the wire exactly once — this response is never repeatable. */
export const beginTotpEnrolment = async () =>
  (await axiosInstance.post<TotpEnrolment>("/v1/mfa/totp")).data;

export const activateTotpEnrolment = async (code: string) => {
  await axiosInstance.post("/v1/mfa/totp/activate", { code });
};

export const setPrimaryFactor = async (type: "SMS" | "TOTP") => {
  await axiosInstance.post("/v1/mfa/primary", { type });
};
