/**
 * The signed-in user, as the API returns it. The shape is the API contract,
 * which is why it lives here rather than being redeclared per app.
 *
 * Two of them, during the port: `ConsoleSession` is `GET /v1/session`, and
 * `User` is legacy `/users/me`, which every screen still on `mock-api` reads.
 */
import { atomWithStorage } from "jotai/utils";

/** Empty means no merchant has been adopted yet — it does not mean platform. */
export type SessionScope = "" | "PLATFORM" | "MERCHANT" | "CUSTOMER";

/**
 * `GET /v1/session`. Deliberately not persisted anywhere: the cookie is
 * HttpOnly, so the server is the only thing that knows whether this session is
 * still live, and a cached copy renders a full shell for a revoked one (D-051).
 */
export interface ConsoleSession {
  personId: string;
  firstName: string;
  lastName: string;
  scope: SessionScope;
  merchantId?: string;
  merchantName?: string;
  shortBusinessName?: string;
  role?: string;
  /** Above one, the console offers a switcher. */
  membershipCount?: number;
  /**
   * The codes the middleware enforces (D-054) — hide a control the server
   * would refuse, never the other way around. Empty on unadopted and customer
   * sessions.
   */
  permissions?: string[];
  mustChangePassword: boolean;
}

/** `GET /v1/session/merchants` — what the picker renders. */
export interface MerchantChoice {
  merchantId: string;
  name: string;
  shortBusinessName?: string;
  role: string;
}

export interface AssociatedMerchant {
  businessLogo?: string | null;
  businessName?: string;
  shortBusinessName?: string;
  merchantType?: string;
  vendingDisabled?: boolean;
  country?: { code: string; name: string };
  currency?: { code: string; name: string };
}

export interface Meter {
  // extend with specific meter fields when available
  [key: string]: any;
}

export interface Wallet {
  // extend with specific wallet fields when available
  [key: string]: any;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dialingCode?: string;
  status?: string;
  isVerified?: boolean;
  passwordUpdatedAt?: string | null;
  accountType?: string;
  roleId?: string | null;
  businessId?: string | null;
  associatedMerchantId?: string | null;
  siteId?: string | null;
  siteAmountOwed?: number;
  actualSiteAmountOwed?: number;
  idCard?: string | null;
  banned?: boolean;
  createdAt?: string;
  updatedAt?: string;
  associatedMerchant?: AssociatedMerchant | null;
  meters?: Meter[];
  wallet?: Wallet | null;
}

/** Legacy only. The v2 session is never persisted — see `ConsoleSession`. */
export const userAtom = atomWithStorage<User | null>("user", null);
