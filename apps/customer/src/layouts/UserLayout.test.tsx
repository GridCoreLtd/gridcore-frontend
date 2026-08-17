import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import UserLayout from "./UserLayout";

/**
 * The header is white-label, so the logo URL is a stranger's and may be absent,
 * stale or unreachable — the anonymised dev rows literally hold "redacted".
 */
const useBranding = vi.fn();
const useSession = vi.fn();

vi.mock("@/features/auth", () => ({
  useBranding: () => useBranding(),
  useSignOut: () => ({ signOut: () => {}, isSigningOut: false }),
}));
vi.mock("@/auth/useSession", () => ({ useSession: () => useSession() }));

function renderLayout(logoUrl?: string) {
  useBranding.mockReturnValue({
    branding: { name: "Danjuma Power", logoUrl },
  });
  useSession.mockReturnValue({
    session: { firstName: "Ada", lastName: "Obi", merchantName: "Danjuma Power" },
  });
  return render(
    <MemoryRouter>
      <UserLayout />
    </MemoryRouter>
  );
}

beforeEach(() => {
  useBranding.mockReset();
  useSession.mockReset();
});

describe("UserLayout branding", () => {
  it("shows the merchant's logo when there is one", () => {
    const { container } = renderLayout("http://assets.test/v1/public/logos/abc");
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "http://assets.test/v1/public/logos/abc"
    );
  });

  it("falls back to the monogram when the logo cannot load", () => {
    const { container } = renderLayout("redacted");
    fireEvent.error(container.querySelector("img")!);

    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("D")).toBeInTheDocument();
  });

  it("shows the monogram when the merchant has no logo", () => {
    const { container } = renderLayout(undefined);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("D")).toBeInTheDocument();
  });
});
