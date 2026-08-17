import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import type { ConsoleSession } from "@gridcore/api-client";
import { gateFor } from "@/auth/scopes";
import { getSession, sessionKey } from "@/auth/useSession";

/**
 * Where a freshly issued session goes.
 *
 * The session is re-read rather than inferred from the login response, which
 * says only `status` and `mustChangePassword` — it does not carry the adopted
 * scope, so nothing else knows whether a merchant was adopted automatically.
 * Reading it also proves the cookie is actually being sent, which is the failure
 * that otherwise shows up several screens later as an unexplained 401.
 */
export function useAuthRedirect() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return async () => {
    // The old session's cached reads are another tenant's once a merchant is
    // adopted, and stale for everyone else.
    queryClient.clear();

    const session = await queryClient.fetchQuery<ConsoleSession>({
      queryKey: sessionKey,
      queryFn: getSession,
    });

    navigate(gateFor(session) ?? "/dashboard", { replace: true });
  };
}
