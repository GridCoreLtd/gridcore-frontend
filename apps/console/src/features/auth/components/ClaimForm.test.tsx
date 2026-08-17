import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError } from "axios";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ClaimForm from "./ClaimForm";

/**
 * The transport is stubbed, not the screen's decisions.
 *
 * What this screen decides is what a 401 and a 422 mean — the first is terminal
 * because the one-time link is gone, the second is not because the link survives
 * a rejected password. Those are the assertions; axios is not.
 *
 * A plain stub rather than `vi.fn()`: the spy tracks the promise it returned,
 * and clearing that tracking between tests strands the rejection, so the run
 * fails on the harness instead of on the screen.
 */
let sent: unknown[] = [];
let respond: () => Promise<void>;

vi.mock("../api", () => ({
  claimPassword: (body: unknown) => {
    sent.push(body);
    return respond();
  },
}));

const rejectsWith = (status: number, body: Record<string, unknown>) => {
  respond = () =>
    Promise.reject(
      new AxiosError("rejected", "ERR_BAD_REQUEST", undefined, undefined, {
        status,
        data: body,
        statusText: "",
        headers: {},
        config: {} as never,
      })
    );
};

const GOOD_PASSWORD = "Correct#2026";

function renderAt(url: string) {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="/claim" element={<ClaimForm />} />
          <Route path="/" element={<p>the login screen</p>} />
        </Routes>
        <Search />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

/** Exposes the live query string, so the token strip is observable. */
function Search() {
  return <span data-testid="search">{useLocation().search}</span>;
}

const fillIn = async (password: string) => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Password"), password);
  await user.type(screen.getByLabelText("Repeat password"), password);
  await user.click(screen.getByRole("button", { name: /set password/i }));
};

beforeEach(() => {
  sent = [];
  respond = () => Promise.resolve();
});

describe("ClaimForm", () => {
  it("refuses a bare visit without asking the API", () => {
    renderAt("/claim");

    expect(screen.getByText(/link cannot be used/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
    expect(sent).toHaveLength(0);
  });

  // The link is a live credential for 72 hours or until spent (D-058).
  it("takes the token out of the address bar", async () => {
    renderAt("/claim?token=tok-123");

    await waitFor(() =>
      expect(screen.getByTestId("search")).toHaveTextContent("")
    );
    expect(screen.getByTestId("search").textContent).not.toContain("tok-123");
  });

  it("still sends the token it read before clearing it", async () => {
    renderAt("/claim?token=tok-123");
    await fillIn(GOOD_PASSWORD);

    await waitFor(() =>
      expect(sent).toEqual([{ token: "tok-123", newPassword: GOOD_PASSWORD }])
    );
  });

  it("sends them to sign in once the password is set", async () => {
    renderAt("/claim?token=tok-123");
    await fillIn(GOOD_PASSWORD);

    expect(await screen.findByText("the login screen")).toBeInTheDocument();
  });

  // Unknown, expired and spent are one answer, and none of them is retryable.
  it("gives up on a spent link rather than inviting a retry", async () => {
    rejectsWith(401, {
      code: "unauthenticated",
      detail: "That link is not valid. Ask for a new one.",
    });
    renderAt("/claim?token=tok-123");
    await fillIn(GOOD_PASSWORD);

    expect(await screen.findByText(/link cannot be used/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
  });

  /**
   * The yup mirror is not the authority and may lag the server's policy, so this
   * sends a password the mirror accepts and the server does not. The token is
   * spent only once the password passes, so the refusal is a retry — the
   * sentence goes on the input, and the form stays.
   */
  it("puts the server's refusal on the input and leaves the form usable", async () => {
    rejectsWith(422, {
      code: "password_rejected",
      detail: "Include a digit.",
      errors: [
        {
          field: "newPassword",
          code: "password_rejected",
          message: "Include a digit.",
        },
      ],
    });
    renderAt("/claim?token=tok-123");
    await fillIn(GOOD_PASSWORD);

    expect(await screen.findByText("Include a digit.")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });
});
