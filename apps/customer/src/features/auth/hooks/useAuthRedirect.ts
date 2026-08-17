import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import type { ConsoleSession } from "@gridcore/api-client";
import { getSession, sessionKey } from "@/auth/useSession";

/**
 * Where a freshly issued session goes. Re-read rather than inferred from the
 * login response: reading it proves the cookie is actually being sent, which
 * otherwise shows up screens later as an unexplained 401.
 */
export function useAuthRedirect() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return async () => {
    queryClient.clear();

    const session = await queryClient.fetchQuery<ConsoleSession>({
      queryKey: sessionKey,
      queryFn: getSession,
    });

    navigate(session.mustChangePassword ? "/set-password" : "/dashboard", {
      replace: true,
    });
  };
}
