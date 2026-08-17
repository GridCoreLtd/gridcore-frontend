import axiosInstance from "@/utils/axios-instance";

import type { Application, ApplicationState, DocumentType } from "./types";

export const listApplications = async (state?: ApplicationState) =>
  (
    await axiosInstance.get<{ data: Application[] }>("/v1/applications", {
      params: state ? { state } : undefined,
    })
  ).data.data;

/**
 * Approval creates the merchant, its admin account and the claim link in one
 * transaction server-side; the queue refetches rather than guessing.
 */
export const decideApplication = async (id: string, decision: "approve" | "reject") =>
  (
    await axiosInstance.post<{ state: string; merchantId?: string }>(
      `/v1/applications/${id}/decision`,
      { decision }
    )
  ).data;

/**
 * Reading a document writes an audit row, so there is no URL to link to — the
 * bytes come back with the session and are handed to the viewer in memory.
 * Nothing is written to the reviewer's disk: a government ID left in Downloads
 * outlives the review and no retention rule reaches it.
 *
 * The response is still `Content-Disposition: attachment`. That header governs
 * navigation, which this never does, so blueprint 15 §6's third layer stays
 * intact for anyone who reaches the URL directly.
 */
export const fetchApplicationDocument = async (id: string, type: DocumentType) => {
  const response = await axiosInstance
    .get<Blob>(`/v1/applications/${id}/documents/${type}`, { responseType: "blob" })
    .catch(async (error: unknown) => {
      // A blob request makes the API's problem+json body a Blob too, which
      // parseApiError cannot read — unwrap it so a refusal keeps its message.
      throw (await asProblemBody(error)) ?? error;
    });

  const disposition = String(response.headers["content-disposition"] ?? "");
  const contentType = String(response.headers["content-type"] ?? response.data.type);

  return {
    filename: /filename="([^"]+)"/.exec(disposition)?.[1] ?? String(type),
    contentType,
    blob: response.data,
  };
};

/** Rewrites a Blob error body back into JSON, in place, or returns undefined. */
async function asProblemBody(error: unknown) {
  const response = (error as { response?: { data?: unknown } })?.response;
  if (!(response?.data instanceof Blob)) return undefined;

  try {
    response.data = JSON.parse(await response.data.text()) as unknown;
  } catch {
    response.data = undefined;
  }
  return error;
}
