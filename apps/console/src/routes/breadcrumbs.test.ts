import { describe, expect, it } from "vitest";

import { trailFor } from "./breadcrumbs";

const labels = (path: string) => trailFor(path).map((c) => c.label);

describe("trailFor", () => {
  it("gives a top-level page a single crumb, which the bar then hides", () => {
    expect(trailFor("/merchants")).toEqual([
      { label: "Merchants", path: "/merchants" },
    ]);
  });

  it("walks a nested page back to its parents", () => {
    expect(labels("/merchants/new-applications")).toEqual([
      "Merchants",
      "New applications",
    ]);
  });

  it("names a :param leaf from its crumb, not the id in the URL", () => {
    expect(trailFor("/merchants/new-applications/01a00b63-37be-70d1")).toEqual([
      { label: "Merchants", path: "/merchants" },
      { label: "New applications", path: "/merchants/new-applications" },
      {
        label: "Review",
        path: "/merchants/new-applications/01a00b63-37be-70d1",
      },
    ]);
  });

  /**
   * `/merchants/:id` and `/merchants/new-applications` both match a two-segment
   * path, and the literal has to win or every application id reads "Merchant".
   */
  it("prefers a literal segment over a :param that would also match", () => {
    expect(labels("/merchants/new-applications")).toEqual([
      "Merchants",
      "New applications",
    ]);
    expect(labels("/merchants/some-merchant-id")).toEqual(["Merchants", "Merchant"]);
  });

  it("skips a path step no route claims rather than inventing one", () => {
    expect(labels("/bulk-messaging/logs/abc")).toEqual(["Bulk Messaging", "Log"]);
  });

  it("returns nothing for a path outside the manifest", () => {
    expect(trailFor("/nowhere")).toEqual([]);
  });
});
