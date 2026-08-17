import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { logout } from "../api";

/**
 * Signing out is a server call. The cookie is HttpOnly, so clearing it here is
 * not possible and would not be sufficient anyway — the token would still
 * authenticate anything that replayed it (story X1).
 *
 * The local state is cleared either way: if the request fails the session may
 * still be live, but leaving one person's cached reads on screen for the next
 * is worse than a session that expires on its own.
 */
export function useSignOut() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const finish = () => {
    queryClient.clear();
    navigate("/", { replace: true });
  };

  const mutation = useMutation({
    mutationFn: logout,
    onSuccess: finish,
    onError: finish,
  });

  return { signOut: () => mutation.mutate(), isSigningOut: mutation.isLoading };
}
