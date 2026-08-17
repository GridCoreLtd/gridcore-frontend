import axiosInstance from "@/utils/axios-instance";

import type { ApplicationFields } from "./schema";

/**
 * The public half of merchant onboarding. Two calls, and the second carries
 * everything — details, documents and the code that proves the phone — in one
 * multipart request, so the OTP authorises the uploads and no attach endpoint
 * needs an authorisation story of its own (D-032).
 *
 * There is deliberately no "verify this code" call: the server checks it when
 * the application is submitted, which is why nothing here claims a phone is
 * verified before then.
 */

export interface SupportedCountry {
  code: string;
  callingCode: string;
  currency: string;
}

export const listCountries = async () =>
  (await axiosInstance.get<{ data: SupportedCountry[] }>("/v1/countries")).data.data;

export const requestApplicationOtp = async (phone: string) =>
  (await axiosInstance.post<{ challengeId: string }>("/v1/applications/otp", { phone })).data;

export const submitApplication = async (
  challengeId: string,
  fields: ApplicationFields
): Promise<{ applicationId: string }> => {
  const body = new FormData();

  body.append("challengeId", challengeId);
  body.append("code", fields.code);
  body.append("firstName", fields.firstName);
  body.append("lastName", fields.lastName);
  body.append("phone", fields.phone);
  body.append("email", fields.email);
  body.append("businessName", fields.businessName);
  body.append("country", fields.country);
  body.append("shortBusinessName", fields.shortBusinessName);
  body.append("address", fields.address);

  // Absent, not empty: the server treats these as optional and an empty string
  // is a value it would have to decide about.
  if (fields.website) body.append("website", fields.website);
  if (fields.description) body.append("description", fields.description);

  body.append("logo", fields.logo);
  body.append("cac", fields.cac);
  body.append("governmentId", fields.governmentId);

  return (await axiosInstance.post("/v1/applications", body)).data;
};
