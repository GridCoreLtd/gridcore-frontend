import { describe, expect, it } from "vitest";

import { customerName, isOffline, type CustomerListItem } from "./types";

const base: CustomerListItem = {
  id: "c1",
  status: "ACTIVE",
  merchantName: "Alpha Power",
  meterCount: 1,
};

describe("customerName", () => {
  it("composes a person's name", () => {
    expect(customerName({ ...base, firstName: "Ada", lastName: "Adeyemi" })).toBe("Ada Adeyemi");
  });

  it("falls back to the merchant's label for an offline customer (D-064)", () => {
    expect(customerName({ ...base, displayName: "Mama Nkechi (Shop 4)" })).toBe(
      "Mama Nkechi (Shop 4)",
    );
  });

  it("prefers the person over a stray label — a person carries the name", () => {
    expect(
      customerName({ ...base, firstName: "Ada", lastName: "Adeyemi", displayName: "wrong" }),
    ).toBe("Ada Adeyemi");
  });
});

describe("isOffline", () => {
  it("no person and a label means offline", () => {
    expect(isOffline({ ...base, displayName: "Ubani Stores" })).toBe(true);
  });

  it("a person-backed customer is not offline", () => {
    expect(isOffline({ ...base, firstName: "Ada", lastName: "Adeyemi" })).toBe(false);
  });
});
