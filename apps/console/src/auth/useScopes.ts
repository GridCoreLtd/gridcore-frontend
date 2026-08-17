import { scopesFor, type Scope } from "./scopes";
import { useSession } from "./useSession";

export function useScopes(): {
  scopes: Scope[];
  isPlatform: boolean;
  isMerchant: boolean;
  isLoading: boolean;
} {
  const { session, isLoading } = useSession();
  const scopes = scopesFor(session);

  return {
    scopes,
    isPlatform: scopes.includes("platform"),
    isMerchant: scopes.includes("merchant"),
    isLoading,
  };
}
