import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ConsoleSession } from "@gridcore/api-client";

import RequireSession from "./RequireSession";

/**
 * `useSession` is stubbed rather than the transport beneath it — the guard's
 * whole job is the routing decision over (session, isLoading).
 */
const useSession = vi.fn();
vi.mock("./useSession", () => ({ useSession: () => useSession() }));

const session = (over: Partial<ConsoleSession> = {}): ConsoleSession => ({
  personId: "p-1",
  firstName: "Ada",
  lastName: "Obi",
  scope: "CUSTOMER",
  mustChangePassword: false,
  ...over,
});

const signedInAs = (over: Partial<ConsoleSession> = {}) =>
  useSession.mockReturnValue({
    session: session(over),
    isLoading: false,
    isSignedIn: true,
  });

function renderAt(at: string) {
  render(
    <MemoryRouter initialEntries={[at]}>
      <Routes>
        <Route
          path={at}
          element={
            <RequireSession>
              <p>the guarded page</p>
            </RequireSession>
          }
        />
        <Route path="/" element={<p>the login screen</p>} />
        <Route path="/set-password" element={<p>the password screen</p>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => useSession.mockReset());

describe("RequireSession", () => {
  it("sends a signed-out visitor to login", () => {
    useSession.mockReturnValue({ session: undefined, isLoading: false, isSignedIn: false });
    renderAt("/dashboard");
    expect(screen.getByText("the login screen")).toBeInTheDocument();
  });

  it("holds a must-change session at the password screen", () => {
    signedInAs({ mustChangePassword: true });
    renderAt("/dashboard");
    expect(screen.getByText("the password screen")).toBeInTheDocument();
  });

  it("lets a customer session through", () => {
    signedInAs();
    renderAt("/dashboard");
    expect(screen.getByText("the guarded page")).toBeInTheDocument();
  });

  // The admin cookie is domain-scoped, so an operator's browser presents it on
  // every portal host — their console session must not render inside a
  // merchant's storefront (D-020).
  it("treats an operator session as not signed in here", () => {
    signedInAs({ scope: "MERCHANT", merchantId: "m-1" });
    renderAt("/dashboard");
    expect(screen.getByText("the login screen")).toBeInTheDocument();
  });

  it("does not trap the password screen in a redirect loop", () => {
    signedInAs({ mustChangePassword: true });
    renderAt("/set-password");
    expect(screen.getByText("the guarded page")).toBeInTheDocument();
  });
});
