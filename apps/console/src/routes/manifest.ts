import type { ComponentType, SVGProps } from "react";

import { Banknote, Calculator, CalendarDays, ChartColumnIncreasing, ChartPie, CircleUser, LayoutGrid, MessagesSquare, Settings, Store, Users, Wallet } from "lucide-react";

import type { Scope } from "@/auth/scopes";

type Loader = () => Promise<{ default: ComponentType<Record<string, never>> }>;
type Icon = ComponentType<SVGProps<SVGSVGElement>>;

export type ConsoleRoute = {
  path: string;
  /** Undefined = every signed-in console user reaches it. */
  scope?: Scope;
  /** Sidebar label. Omit to route without adding nav (detail pages). */
  label?: string;
  /**
   * Breadcrumb text, when it differs from the sidebar's or there is no sidebar
   * entry. A route with neither is skipped in the trail; a `:param` leaf takes
   * its name at runtime from `usePageCrumb`.
   */
  crumb?: string;
  icon?: Icon;
  element: Loader;
};

/**
 * Every route inside the shell, and the only place they are declared.
 *
 * That branch of the router is built from this array and the sidebar is
 * rendered from the same array filtered by the session's scopes — so a shell
 * route can never exist without nav, nor appear in nav without access.
 *
 * The auth screens sit outside it on purpose: they carry no nav and run before
 * there is a session to read a scope from. They are declared in `routes/`.
 */
export const consoleRoutes: ConsoleRoute[] = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: LayoutGrid,
    element: () => import("@/pages/Dashboard"),
  },
  {
    path: "/customers",
    label: "Customers",
    icon: Users,
    element: () => import("@/pages/Customers"),
  },
  {
    path: "/customers/bulk-import",
    crumb: "Bulk import",
    element: () => import("@/pages/CustomerBulkImport"),
  },
  {
    path: "/customers/:id",
    crumb: "Customer",
    element: () => import("@/pages/CustomerDetail"),
  },
  {
    path: "/meters",
    label: "Meters",
    icon: Calculator,
    element: () => import("@/pages/Meters"),
  },
  {
    path: "/meters/:id",
    crumb: "Meter",
    element: () => import("@/pages/MeterDetail"),
  },
  {
    path: "/offline-meters",
    label: "Offline Top Up History",
    icon: Calculator,
    element: () => import("@/pages/OfflineMeters"),
  },
  {
    path: "/transactions",
    label: "Transaction History",
    icon: ChartColumnIncreasing,
    element: () => import("@/pages/Transactions"),
  },
  {
    path: "/topups",
    label: "Top Up History",
    icon: ChartPie,
    element: () => import("@/pages/Topups"),
  },
  {
    path: "/wallet",
    label: "Wallet",
    icon: Wallet,
    element: () => import("@/pages/Wallet"),
  },
  {
    path: "/profile",
    label: "Profile",
    icon: CircleUser,
    element: () => import("@/pages/Profile"),
  },

  // ---- platform operators only ----
  {
    path: "/merchants",
    scope: "platform",
    label: "Merchants",
    icon: Store,
    element: () => import("@/pages/platform/Merchants"),
  },
  {
    path: "/merchants/new-applications",
    scope: "platform",
    crumb: "New applications",
    element: () => import("@/pages/platform/NewApplications"),
  },
  {
    path: "/merchants/new-applications/:id",
    scope: "platform",
    crumb: "Review",
    element: () => import("@/pages/platform/NewApplicationDetail"),
  },
  {
    path: "/merchants/:id",
    scope: "platform",
    crumb: "Merchant",
    element: () => import("@/pages/platform/MerchantDetail"),
  },
  {
    path: "/payouts",
    scope: "platform",
    label: "Payouts",
    icon: Banknote,
    element: () => import("@/pages/platform/Payouts"),
  },
  {
    path: "/payout-schedule",
    scope: "platform",
    label: "Payout Schedule",
    icon: CalendarDays,
    element: () => import("@/pages/platform/PayoutSchedule"),
  },
  {
    path: "/team",
    scope: "platform",
    label: "Team",
    icon: Users,
    element: () => import("@/pages/platform/Team"),
  },
  {
    path: "/bulk-messaging",
    scope: "platform",
    label: "Bulk Messaging",
    icon: MessagesSquare,
    element: () => import("@/pages/platform/BulkMessaging"),
  },
  {
    path: "/bulk-messaging/logs/:id",
    scope: "platform",
    crumb: "Log",
    element: () => import("@/pages/platform/BulkMessagingLogDetail"),
  },

  // ---- merchants only ----
  {
    path: "/account-settings",
    scope: "merchant",
    label: "Account Settings",
    icon: Settings,
    element: () => import("@/pages/AccountSettings"),
  },
];

/** Sidebar entries this session may see. */
export const navFor = (scopes: Scope[]) =>
  consoleRoutes.filter((r) => r.label && (!r.scope || scopes.includes(r.scope)));
