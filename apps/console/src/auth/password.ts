import axiosInstance from "@/utils/axios-instance";

/**
 * Lives here rather than in `features/auth` because two features need it: the
 * forced change at login and the voluntary one on the profile — and a feature
 * may not import a feature.
 */
export interface SetPasswordRequest {
  challengeId: string;
  code: string;
  newPassword: string;
}

export const requestPasswordOtp = async () =>
  (await axiosInstance.post<{ challengeId: string }>("/v1/auth/password/otp"))
    .data;

/** Ends every session for this person, including this one. */
export const setPassword = async (body: SetPasswordRequest) => {
  await axiosInstance.post("/v1/auth/password", body);
};
