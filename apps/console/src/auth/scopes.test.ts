import type { ConsoleSession } from "@gridcore/api-client";
import { describe, expect, it } from "vitest";

import { gateFor, scopesFor } from "./scopes";

const session = (over: Partial<ConsoleSession> = {}): ConsoleSession => ({
  personId: "p-1",
  firstName: "Ada",
  lastName: "Obi",
  scope: "MERCHANT",
  mustChangePassword: false,
  ...over,
});

describe("scopesFor", () => {
  it("maps the two console audiences", () => {
    expect(scopesFor(session({ scope: "PLATFORM" }))).toEqual(["platform"]);
    expect(scopesFor(session({ scope: "MERCHANT" }))).toEqual(["merchant"]);
  });

  // The whole point of D-050: an empty merchant meant "platform" on one
  // membership and "nothing at all" on several, and the obvious read handed one
  // tenant every merchant's rows.
  it("gives an unadopted session no scope, not platform", () => {
    expect(scopesFor(session({ scope: "" }))).toEqual([]);
  });

  it("gives a customer no console scope", () => {
    expect(scopesFor(session({ scope: "CUSTOMER" }))).toEqual([]);
  });

  it("gives an absent session no scope", () => {
    expect(scopesFor(undefined)).toEqual([]);
  });
});

describe("gateFor", () => {
  it("lets a usable session through", () => {
    expect(gateFor(session())).toBeNull();
  });

  it("sends an unadopted session to the picker", () => {
    expect(gateFor(session({ scope: "" }))).toBe("/choose-merchant");
  });

  it("sends a must-change session to the password screen", () => {
    expect(gateFor(session({ mustChangePassword: true }))).toBe("/set-password");
  });

  // Both at once. The password gate wins, and it is free: setting a password
  // ends every session, so the next login meets the merchant gate alone.
  it("puts the password before the picker", () => {
    expect(gateFor(session({ scope: "", mustChangePassword: true }))).toBe(
      "/set-password"
    );
  });
});
