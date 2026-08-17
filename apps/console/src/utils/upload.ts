import axiosInstance from "@/utils/axios-instance";

/**
 * File upload for the console.
 *
 * ── Why the old implementation was removed ────────────────────────────────
 * It constructed an S3 client in the browser using long-lived IAM credentials
 * from `NEXT_PUBLIC_ACCESS_KEY_ID` / `NEXT_PUBLIC_SECRET_ACCESS_KEY`. Build
 * tools inline those into the JavaScript bundle, so anyone who loaded the page
 * could read the account's access key out of the served JS. Vite's `VITE_`
 * prefix inlines identically — renaming the variable would not fix anything.
 *
 * ── Current state: DISABLED, pending the backend ─────────────────────────
 * The presigned-URL implementation below is written and ready; flip
 * `UPLOADS_ENABLED` to `true` once the endpoint exists.
 *
 * Expected contract:
 *   POST /uploads/presign  { fileName, contentType }
 *     -> { uploadUrl: string, fileUrl: string }
 *
 * If the backend instead accepts the file directly (multipart proxy), replace
 * the body of `uploadFile` with a single POST — callers only depend on
 * `uploadFile(file) => Promise<string>`.
 */

/** Flip to `true` when the upload endpoint is live. */
export const UPLOADS_ENABLED = false;

/** Thrown when uploads are switched off, so callers can message it clearly. */
export class UploadUnavailableError extends Error {
  constructor() {
    super("File upload is temporarily unavailable. Please try again later.");
    this.name = "UploadUnavailableError";
  }
}

/**
 * Resolves to the stored file's URL. THROWS on failure — it must never resolve
 * to null or "", because callers assign the result straight onto a record and
 * a falsy value would silently wipe the existing document.
 */
export async function uploadFile(file: File): Promise<string> {
  if (!UPLOADS_ENABLED) {
    throw new UploadUnavailableError();
  }

  const { data } = await axiosInstance.post("/uploads/presign", {
    fileName: file.name,
    contentType: file.type,
  });

  const { uploadUrl, fileUrl } = data.data ?? data;
  if (!uploadUrl || !fileUrl) {
    throw new Error("Presign response did not include uploadUrl/fileUrl");
  }

  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  if (!res.ok) {
    throw new Error(`Upload failed with status ${res.status}`);
  }

  return fileUrl;
}
