export interface LoginRequest {
  /** E.164 phone or email — the API decides by shape, so there is one failure. */
  identifier: string;
  password: string;
}

export interface LoginResponse {
  status: "mfa_required" | "complete";
  challengeId?: string;
  factorType?: "SMS" | "TOTP";
  mustChangePassword?: boolean;
}

export interface VerifyMfaRequest {
  challengeId: string;
  code: string;
}

/** Carried from the login screen to the MFA screen through router state. */
export interface MfaHandoff {
  challengeId: string;
  factorType?: "SMS" | "TOTP";
}

export interface ClaimPasswordRequest {
  token: string;
  newPassword: string;
}
