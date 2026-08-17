import type { ConsoleSession, MerchantChoice } from "@gridcore/api-client";
import axiosInstance from "@/utils/axios-instance";

import type {
  ClaimPasswordRequest,
  LoginRequest,
  LoginResponse,
  VerifyMfaRequest,
} from "./types";

/** A correct password sets no cookie — it returns a challenge (D-017). */
export const login = async (body: LoginRequest) =>
  (await axiosInstance.post<LoginResponse>("/v1/auth/login", body)).data;

export const verifyMfa = async (body: VerifyMfaRequest) =>
  (await axiosInstance.post<LoginResponse>("/v1/auth/mfa", body)).data;

/** Rotates the code behind the same challengeId; the expiry window is unchanged. */
export const resendMfaOtp = async (challengeId: string) => {
  await axiosInstance.post("/v1/auth/mfa/otp", { challengeId });
};

export const listSessionMerchants = async () =>
  (await axiosInstance.get<{ data: MerchantChoice[] }>("/v1/session/merchants"))
    .data.data;

/** Rotates the cookie: everything derived from the old session is now stale. */
export const adoptMerchant = async (merchantId: string) =>
  (await axiosInstance.post<ConsoleSession>("/v1/session/merchant", {
    merchantId,
  })).data;

export const logout = async () => {
  await axiosInstance.post("/v1/auth/logout");
};

/**
 * Turns an approval's one-time link into a first password. Public — the token is
 * the whole of the authorisation, and it is spent only once the password itself
 * passes, so a rejected one leaves the link usable.
 */
export const claimPassword = async (body: ClaimPasswordRequest) => {
  await axiosInstance.post("/v1/auth/password/claim", body);
};
