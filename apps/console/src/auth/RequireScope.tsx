import type { ReactNode } from "react";

import { Navigate, Outlet, useLocation } from "react-router-dom";

import SectionLoader from "@/components/shared/SectionLoader";

import { gateFor, scopesFor, type Scope } from "./scopes";
import { useSession } from "./useSession";

/**
 * The console's one routing decision.
 *
 * Every guarded route passes through here, so a session that must change its
 * password or has adopted no merchant is sent to the right screen whether it
 * arrived from login or from a bookmark. Putting the branch in the MFA screen's
 * success handler would cover the login path only, and F5 would land in a shell
 * the API refuses every request from.
 *
 * This is a UX boundary, not a security one. It stops a merchant navigating
 * into a platform screen and seeing a broken shell — it does NOT stop them
 * reading platform data. Only the API can do that, and it independently answers
 * 401 / 403 / 409 for the same three states.
 */
export default function RequireScope({
  scope,
  children,
}: {
  scope?: Scope;
  /** Omitted when used as a layout route; the matched child renders instead. */
  children?: ReactNode;
}) {
  const location = useLocation();
  const { session, isLoading } = useSession();

  // The cookie is unreadable, so "signed in?" is a request. Everything waits on
  // it rather than guessing from local state that may describe a dead session.
  if (isLoading) return <SectionLoader />;

  if (!session) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  const gate = gateFor(session);
  if (gate && gate !== location.pathname) {
    return <Navigate to={gate} replace state={{ from: location.pathname }} />;
  }

  if (scope && !scopesFor(session).includes(scope)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children ?? <Outlet />}</>;
}
