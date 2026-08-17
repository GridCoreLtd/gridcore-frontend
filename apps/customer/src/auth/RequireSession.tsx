import type { ReactNode } from "react";

import { Navigate, Outlet, useLocation } from "react-router-dom";

import SectionLoader from "@/components/shared/SectionLoader";

import { useSession } from "./useSession";

/**
 * The portal's one routing decision, replacing the legacy `RequireAuth` cookie
 * test (an HttpOnly cookie made it permanently false).
 *
 * A session that is not a customer's is treated as not signed in *here*: the
 * admin cookie is domain-scoped, so an operator's browser presents it on every
 * portal host, and rendering their console session inside a merchant's
 * storefront would wear the wrong hat (D-020). They can sign in as a customer
 * if they are one.
 *
 * UX boundary only — the API refuses a customer session on operator routes and
 * vice versa on its own (D-054).
 */
export default function RequireSession({ children }: { children?: ReactNode }) {
  const location = useLocation();
  const { session, isLoading } = useSession();

  if (isLoading) return <SectionLoader />;

  if (!session || session.scope !== "CUSTOMER") {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (session.mustChangePassword && location.pathname !== "/set-password") {
    return <Navigate to="/set-password" replace />;
  }

  return <>{children ?? <Outlet />}</>;
}
