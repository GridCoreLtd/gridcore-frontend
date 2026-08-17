import { Suspense, lazy } from "react";

import type { RouteObject } from "react-router-dom";

import RequireScope from "@/auth/RequireScope";
import SectionLoader from "@/components/shared/SectionLoader";
import ConsoleLayout from "@/layouts/ConsoleLayout";
import AppError from "@/pages/AppError";

import { consoleRoutes } from "./manifest";

const authPage = (load: () => Promise<{ default: React.ComponentType }>) =>
  async () => ({ Component: (await load()).default });

/**
 * Builds the router from the manifest.
 *
 * Every console page is lazy, so a merchant session never downloads a platform
 * chunk even though both ship in the same build.
 *
 * Three tiers: no session at all, a session that cannot use the app yet, and a
 * session that can. The middle tier carries no chrome — a nav rendered from a
 * scope the session has not adopted would be a nav to nowhere.
 *
 * The auth screens are declared here rather than in the manifest: they carry no
 * nav and run before there is a session to read a scope from.
 */
export const routes: RouteObject[] = [
  {
    // A failed chunk or a render crash shows a reload screen; without this the
    // app blanks silently, which is how it failed before.
    errorElement: <AppError />,
    children: [
      { path: "/", lazy: authPage(() => import("@/pages/auth/Login")) },
      // No session yet: the cookie arrives only when the second factor passes.
      { path: "/mfa", lazy: authPage(() => import("@/pages/auth/Mfa")) },
      // No session either: the one-time link from an approval is the whole of
      // the authorisation, so this sits outside every gate.
      { path: "/claim", lazy: authPage(() => import("@/pages/auth/Claim")) },

      // Both still linked from the login screen; v2 self-service reset is
      // unbuilt and these say so rather than posting to a dead endpoint (D-058).
      {
        path: "/forgot-password",
        lazy: authPage(() => import("@/pages/auth/ComingSoon")),
      },
      {
        path: "/password-reset",
        lazy: authPage(() => import("@/pages/auth/ComingSoon")),
      },

      // A session, held at a gate — or, for the picker, choosing to switch.
      {
        element: <RequireScope />,
        children: [
          {
            path: "/choose-merchant",
            lazy: authPage(() => import("@/pages/auth/ChooseMerchant")),
          },
          {
            path: "/set-password",
            lazy: authPage(() => import("@/pages/auth/SetPassword")),
          },
        ],
      },

      {
        element: (
          <RequireScope>
            <ConsoleLayout />
          </RequireScope>
        ),
        children: consoleRoutes.map((route) => {
          const Page = lazy(route.element);

          return {
            path: route.path,
            element: (
              <RequireScope scope={route.scope}>
                <Suspense fallback={<SectionLoader />}>
                  <Page />
                </Suspense>
              </RequireScope>
            ),
          };
        }),
      },
    ],
  },
];
