/**
 * Console access scopes.
 *
 * The console serves two audiences from one build: platform operators (the old
 * `admin` app) and merchants (the old `merchant` app). Which routes a session
 * gets is decided here, not by which app was deployed.
 *
 * The source is `membership.role_scope`, carried on the session and enforced by
 * the API — the frontend never asks for a scope, it is told one. Permission
 * codes are deliberately not part of this: nothing enforces them server-side
 * yet, and a UI that hides what the server would allow is not a boundary.
 */
import type { ConsoleSession, SessionScope } from "@gridcore/api-client";

export type Scope = "platform" | "merchant";

export function scopesFor(session: ConsoleSession | undefined): Scope[] {
  switch (session?.scope) {
    case "PLATFORM":
      return ["platform"];
    case "MERCHANT":
      return ["merchant"];
    // "" is a session that has adopted no merchant, and CUSTOMER never reaches
    // the console at all. Neither holds a console scope.
    default:
      return [];
  }
}

export const hasScope = (scopes: Scope[], required?: Scope) =>
  !required || scopes.includes(required);

/** Where a session that cannot yet use the app has to go first. */
export function gateFor(session: ConsoleSession | undefined): string | null {
  if (!session) return null;
  if (session.mustChangePassword) return "/set-password";
  if (session.scope === "") return "/choose-merchant";
  return null;
}

export type { SessionScope };
