import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ConsoleSession } from "@gridcore/api-client";

import RequireScope from "./RequireScope";

/**
 * `useSession` is stubbed rather than the transport beneath it.
 *
 * The guard's whole job is the routing decision over (session, isLoading) —
 * fetching is `useSession`'s. Driving it through react-query would put a real
 * cache, a real retryer and real promise timing between the input and the
 * assertion, none of which is what these tests are about.
 */
const useSession = vi.fn();
vi.mock("./useSession", () => ({ useSession: () => useSession() }));

const session = (over: Partial<ConsoleSession> = {}): ConsoleSession => ({
  personId: "p-1",
  firstName: "Ada",
  lastName: "Obi",
  scope: "MERCHANT",
  mustChangePassword: false,
  ...over,
});

const signedInAs = (over: Partial<ConsoleSession> = {}) =>
  useSession.mockReturnValue({
    session: session(over),
    isLoading: false,
    isSignedIn: true,
  });

/** Renders the guard at `at`, with every destination it can redirect to. */
function renderAt(at: string, scope?: "platform" | "merchant") {
  render(
    <MemoryRouter initialEntries={[at]}>
      <Routes>
        <Route
          path={at}
          element={
            <RequireScope scope={scope}>
              <p>the guarded page</p>
            </RequireScope>
          }
        />
        <Route path="/" element={<p>the login screen</p>} />
        <Route path="/dashboard" element={<p>the dashboard</p>} />
        <Route path="/choose-merchant" element={<p>the picker</p>} />
        <Route path="/set-password" element={<p>the password screen</p>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => useSession.mockReset());

describe("RequireScope", () => {
  it("waits for the session rather than guessing", () => {
    useSession.mockReturnValue({ isLoading: true, isSignedIn: false });
    renderAt("/meters");

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("the guarded page")).not.toBeInTheDocument();
  });

  // The cookie is unreadable, so "signed in?" is a 401 or a 200 and nothing else.
  it("sends a request with no session to login", () => {
    useSession.mockReturnValue({ isLoading: false, isSignedIn: false });
    renderAt("/meters");

    expect(screen.getByText("the login screen")).toBeInTheDocument();
  });

  it("renders the page for a session that may use it", () => {
    signedInAs();
    renderAt("/meters");

    expect(screen.getByText("the guarded page")).toBeInTheDocument();
  });

  // 409 merchant_selection_required, expressed as routing rather than an error.
  it("sends an unadopted session to the picker", () => {
    signedInAs({ scope: "" });
    renderAt("/meters");

    expect(screen.getByText("the picker")).toBeInTheDocument();
  });

  it("sends a must-change session to the password screen", () => {
    signedInAs({ mustChangePassword: true });
    renderAt("/meters");

    expect(screen.getByText("the password screen")).toBeInTheDocument();
  });

  // Both gates at once: the password wins, and the picker is not reachable
  // until it is satisfied.
  it("puts the password before the picker", () => {
    signedInAs({ scope: "", mustChangePassword: true });
    renderAt("/choose-merchant");

    expect(screen.getByText("the password screen")).toBeInTheDocument();
  });

  // Without this the guard bounces the gate destination back to itself forever.
  it("lets a gated session reach the screen it was sent to", () => {
    signedInAs({ scope: "" });
    renderAt("/choose-merchant");

    expect(screen.getByText("the guarded page")).toBeInTheDocument();
  });

  // The switcher: an adopted session asking for the picker deliberately is not
  // sent away, because one route serves both jobs.
  it("lets an adopted session open the picker to switch", () => {
    signedInAs();
    renderAt("/choose-merchant");

    expect(screen.getByText("the guarded page")).toBeInTheDocument();
  });

  it("keeps a merchant out of a platform route", () => {
    signedInAs({ scope: "MERCHANT" });
    renderAt("/payouts", "platform");

    expect(screen.getByText("the dashboard")).toBeInTheDocument();
  });

  it("lets a platform operator into a platform route", () => {
    signedInAs({ scope: "PLATFORM" });
    renderAt("/payouts", "platform");

    expect(screen.getByText("the guarded page")).toBeInTheDocument();
  });
});
