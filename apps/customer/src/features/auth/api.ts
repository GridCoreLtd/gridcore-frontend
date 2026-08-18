import axiosInstance from "@/utils/axios-instance";

import type { LoginRequest, LoginResponse, PortalBranding, VerifyMfaRequest } from "./types";

/**
 * MFA is opt-in for a customer (D-017), so `complete` — a session on the first
 * call — is the common answer here, unlike the console.
 */
export const login = async (body: LoginRequest) =>
  (await axiosInstance.post<LoginResponse>("/v1/auth/login", body)).data;

export const verifyMfa = async (body: VerifyMfaRequest) =>
  (await axiosInstance.post<LoginResponse>("/v1/auth/mfa", body)).data;

/** Rotates the code behind the same challengeId; the expiry window is unchanged. */
export const resendMfaOtp = async (challengeId: string) => {
  await axiosInstance.post("/v1/auth/mfa/otp", { challengeId });
};

export const logout = async () => {
  await axiosInstance.post("/v1/auth/logout");
};

/** Public — it renders the sign-in screen before any session exists. */
export const getPortalBranding = async (slug: string) =>
  (
    await axiosInstance.get<PortalBranding>("/v1/portal/branding", {
      params: { slug },
    })
  ).data;

export const requestPasswordOtp = async () =>
  (await axiosInstance.post<{ challengeId: string }>("/v1/auth/password/otp")).data;

/** Ends every session for this person, including this one. */
export const setPassword = async (body: {
  challengeId: string;
  code: string;
  newPassword: string;
}) => {
  await axiosInstance.post("/v1/auth/password", body);
};

/**
 * Turns the welcome SMS's one-time link into a first password (blueprint 44).
 * Public — the token is the whole authorisation, spent only when the password
 * itself passes, so a rejected one leaves the link usable.
 */
export const claimPassword = async (body: { token: string; newPassword: string }) => {
  await axiosInstance.post("/v1/auth/password/claim", body);
};
