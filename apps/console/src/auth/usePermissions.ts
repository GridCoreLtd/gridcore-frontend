import { useSession } from "./useSession";

/**
 * The console finally reads the permissions the session has carried all along
 * (blueprint 49). Hiding a control here is courtesy, never enforcement — the
 * server refuses regardless (S1's AC).
 */
export function usePermissions(): {
  permissions: string[];
  can: (code: string) => boolean;
  isLoading: boolean;
} {
  const { session, isLoading } = useSession();
  const permissions = session?.permissions ?? [];
  return {
    permissions,
    can: (code: string) => permissions.includes(code),
    isLoading,
  };
}
