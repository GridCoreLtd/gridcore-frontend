import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { ConsoleSession } from "@gridcore/api-client";
import axiosInstance from "@/utils/axios-instance";

export const sessionKey = ["session"];

/**
 * Lives here rather than in `features/auth` because `src/auth/` is shared and a
 * shared module may not import a feature — and the session is what every
 * feature is gated on.
 */
export const getSession = async () =>
  (await axiosInstance.get<ConsoleSession>("/v1/session")).data;

/**
 * The only signed-in test in the app.
 *
 * There is nothing on the client to ask — the cookie is HttpOnly — so this is a
 * request, and a 401 is the answer "no". Every consumer therefore has a loading
 * state, including on a cold load and on F5.
 *
 * Not retried: a 401 is a legitimate answer, and retrying it delays the redirect
 * to login by the backoff.
 */
export function useSession() {
  const { data, isLoading, isError } = useQuery<ConsoleSession>({
    queryKey: sessionKey,
    queryFn: getSession,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return { session: data, isLoading, isSignedIn: Boolean(data) && !isError };
}

/**
 * Adopting a merchant rotates the cookie and re-resolves permissions, so
 * everything derived from the old session is wrong the moment it returns —
 * including reads that succeeded a second earlier under the other merchant.
 */
export function useResetSession() {
  const queryClient = useQueryClient();
  return () => queryClient.clear();
}
