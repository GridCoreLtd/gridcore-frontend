export interface MfaFactorView {
  type: "SMS" | "TOTP";
  status: "PENDING" | "ACTIVE" | "REVOKED";
  isPrimary: boolean;
  enrolledAt?: string;
  lastUsedAt?: string;
}

export interface MfaSettings {
  phone: string;
  factors: MfaFactorView[];
}

export interface TotpEnrolment {
  secret: string;
  otpauthUrl: string;
}
