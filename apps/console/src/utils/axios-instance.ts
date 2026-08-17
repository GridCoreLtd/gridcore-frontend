import { createSessionClient } from "@gridcore/api-client";

/**
 * The console's one client, against the v2 API.
 *
 * Same-origin: nginx serves `/v1` from the Go service under the console's own
 * host, so the session cookie is first-party and there is no CORS. It is also
 * what makes the audience resolve to CONSOLE — that comes from `Host`, and
 * `api.<domain>` would resolve to a customer portal until D-033 lands.
 *
 * The base URL is empty rather than absent so `VITE_API_URL` can point
 * elsewhere without touching code. No `onExpired` redirect: `RequireScope`
 * reads the session and routes, so an expired one reaches login through the
 * router rather than a hard navigation that discards where it came from.
 *
 * The fourteen feature areas still call legacy paths through this. They answer
 * 404 until their v2 endpoints exist, which is the truthful state — `mock-api`
 * no longer stands in for them.
 */
export default createSessionClient({
  baseURL: import.meta.env.VITE_API_URL,
});
