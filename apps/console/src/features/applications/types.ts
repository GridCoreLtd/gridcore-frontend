export type ApplicationState = "APPLIED" | "APPROVED" | "REJECTED";

export type DocumentType = "CAC" | "GOVERNMENT_ID";

/** `GET /v1/applications` — the operator queue (blueprint 34). */
export interface Application {
  id: string;
  state: ApplicationState;
  name: string;
  country: string;
  shortBusinessName: string;
  address: string;
  submittedAt: string;
  decidedAt?: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail: string;
  /**
   * Which KYC types are attached — never ids and never storage keys. Required
   * at submission since blueprint 39, so anything filed after that carries
   * both; older applications may carry neither.
   */
  documents?: DocumentType[];
}
