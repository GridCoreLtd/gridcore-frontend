import { useQuery } from "@tanstack/react-query";

import type { ConsoleSession } from "@gridcore/api-client";
import axiosInstance from "@/utils/axios-instance";

export const sessionKey = ["session"];

/**
 * Lives in `src/auth/` because the session is what every feature is gated on,
 * and a shared module may not import a feature.
 */
export const getSession = async () =>
  (await axiosInstance.get<ConsoleSession>("/v1/session")).data;

/**
 * The only signed-in test in the app.
 *
 * There is nothing on the client to ask — the cookie is HttpOnly — so this is a
 * request, and a 401 is the answer "no". Not retried: a 401 is a legitimate
 * answer, and retrying it delays the redirect to login by the backoff.
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
