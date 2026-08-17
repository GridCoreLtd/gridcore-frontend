import * as yup from "yup";

/**
 * Mirrors the server exactly. The server is what enforces it — this only saves a
 * round trip, and every rule here has a counterpart in
 * `internal/merchant/entity/white_label.go` or the submit use case.
 */

export const MAX_SUBDOMAIN = 20;
export const MAX_LOGO_MB = 5;
export const MAX_DOCUMENT_MB = 10;

/** A DNS label: the short name becomes a hostname, so it has to be one. */
const DNS_LABEL = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

/** `NewWhiteLabelProfile`'s list. Refused at submission, so say so first. */
const RESERVED = new Set(["admin", "api", "www"]);

/** JPEG and PNG only — SVG executes when rendered and the server refuses it. */
export const LOGO_TYPES = "image/jpeg,image/png";
export const DOCUMENT_TYPES = "image/jpeg,image/png,application/pdf";

const file = (maxMB: number, accept: string, required: string) =>
  yup
    .mixed<File>()
    .required(required)
    .test("is-file", required, (value) => value instanceof File)
    .test(
      "type",
      "That file type is not accepted.",
      (value) => !(value instanceof File) || accept.split(",").includes(value.type)
    )
    .test(
      "size",
      `Keep it under ${maxMB}MB.`,
      (value) => !(value instanceof File) || value.size <= maxMB * 1024 * 1024
    );

export const businessStep = yup.object({
  businessName: yup.string().trim().required("What is the business called?"),

  shortBusinessName: yup
    .string()
    .trim()
    .lowercase()
    .required("Choose the address your customers will use")
    .max(MAX_SUBDOMAIN, `Up to ${MAX_SUBDOMAIN} characters.`)
    .matches(
      DNS_LABEL,
      "Letters, digits and hyphens only, starting and ending with a letter or digit."
    )
    .test("reserved", "That name is not available.", (value) => !RESERVED.has(value ?? "")),

  country: yup.string().required("Where does the business operate?"),
  address: yup.string().trim().required("Where is the business based?"),

  // Optional on the server, so optional here — a merchant with no website was
  // being refused by the browser for a request the API would have accepted.
  website: yup
    .string()
    .trim()
    .optional()
    .test(
      "url",
      "Include the full address, starting http:// or https://",
      (value) => !value || /^https?:\/\/\S+$/.test(value)
    ),
  description: yup.string().trim().optional(),
});

export const documentsStep = yup.object({
  logo: file(MAX_LOGO_MB, LOGO_TYPES, "Add your logo"),
  cac: file(MAX_DOCUMENT_MB, DOCUMENT_TYPES, "Add your CAC certificate"),
  governmentId: file(MAX_DOCUMENT_MB, DOCUMENT_TYPES, "Add your government ID"),
});

export const contactStep = yup.object({
  firstName: yup.string().trim().required("Your first name"),
  lastName: yup.string().trim().required("Your last name"),
  email: yup.string().trim().email("Check that email address").required("Your email address"),
  phone: yup
    .string()
    .trim()
    .required("Your phone number")
    .matches(/^\+[1-9]\d{6,14}$/, "Include the country code, e.g. +234 801 234 5678"),
  code: yup
    .string()
    .trim()
    .required("Enter the code we sent")
    .matches(/^\d{6}$/, "The code is six digits"),
});

export const applicationSchema = businessStep.concat(documentsStep).concat(contactStep);

export type ApplicationFields = yup.InferType<typeof applicationSchema>;

/** The fields each step owns, so a step validates only what it shows. */
export const STEP_FIELDS = [
  ["businessName", "shortBusinessName", "country", "address", "website", "description"],
  ["logo", "cac", "governmentId"],
  ["firstName", "lastName", "email", "phone", "code"],
] as const satisfies readonly (readonly (keyof ApplicationFields)[])[];
