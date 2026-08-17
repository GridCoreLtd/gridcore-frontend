import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { logout } from "../api";

/**
 * Signing out is a server call — the cookie is HttpOnly, and clearing it here
 * would not end the session anyway (story X1). Local state is cleared either
 * way: cached reads left behind for the next person are worse than a session
 * that expires on its own.
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
