import { createSessionClient } from "@gridcore/api-client";

/**
 * The customer portal's one client, against the v2 API.
 *
 * Same-origin: nginx serves `/v1` from the Go service under every portal host
 * (`*.gridcore.test.net` locally), so the host-scoped session cookie is
 * first-party and there is no CORS. The base URL is empty rather than absent so
 * `VITE_API_URL` can point elsewhere without touching code.
 *
 * The legacy feature screens are no longer routed; each returns behind this
 * client when its customer read model exists.
 */
export default createSessionClient({
  baseURL: import.meta.env.VITE_API_URL,
});
