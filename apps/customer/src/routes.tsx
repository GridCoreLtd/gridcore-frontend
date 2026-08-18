import type { RouteObject } from "react-router-dom";

import RequireSession from "@/auth/RequireSession";
import UserLayout from "@/layouts/UserLayout";
import AppError from "@/pages/AppError";

/**
 * Adapts a default-exporting page module to React Router's `lazy` contract.
 *
 * Using route-level `lazy` rather than `React.lazy` is deliberate: the data
 * router resolves it before rendering, so no Suspense boundary is needed and
 * a slow chunk never blanks the whole app.
 */
const page = (load: () => Promise<{ default: React.ComponentType }>) => async () => ({
  Component: (await load()).default,
});


export const routes: RouteObject[] = [
  {
    errorElement: <AppError />,
    children: [
      { path: "/", lazy: page(() => import("@/pages/Login")) },
      { path: "/mfa", lazy: page(() => import("@/pages/Mfa")) },
      { path: "/claim", lazy: page(() => import("@/pages/Claim")) },
      {
        element: <RequireSession />,
        children: [
          { path: "/set-password", lazy: page(() => import("@/pages/SetPassword")) },
          {
            element: <UserLayout />,
            children: [
              { path: "/dashboard", lazy: page(() => import("@/pages/Dashboard")) },
              { path: "/analytics", lazy: page(() => import("@/pages/ComingSoon")) },
              { path: "/my-meters", lazy: page(() => import("@/pages/MyMeters")) },
              { path: "/payments", lazy: page(() => import("@/pages/ComingSoon")) },
              { path: "/profile", lazy: page(() => import("@/pages/ComingSoon")) },
              { path: "/topup", lazy: page(() => import("@/pages/ComingSoon")) },
            ],
          },
        ],
      },
    ],
  },
];
