import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError } from "axios";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ClaimForm from "./ClaimForm";

/**
 * The console's ClaimForm contract, on the portal: a bare visit is terminal, the
 * token leaves the address bar but is still sent, 401 is terminal, a 422 is a
 * retry on the input. The transport and the branding read are stubbed — this
 * screen's decisions are what is under test (the console test's pattern: a
 * plain stub, never vi.fn, so a rejection is not stranded).
 */
let sent: unknown[] = [];
let respond: () => Promise<void>;

vi.mock("../api", () => ({
  claimPassword: (body: unknown) => {
    sent.push(body);
    return respond();
  },
}));

vi.mock("../useBranding", () => ({
  useBranding: () => ({
    branding: { name: "Acme Power", slug: "acme" },
    isLoading: false,
  }),
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
      }),
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
    </QueryClientProvider>,
  );
}

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

describe("ClaimForm (portal)", () => {
  it("refuses a bare visit without asking the API", () => {
    renderAt("/claim");

    expect(screen.getByText(/link cannot be used/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
    expect(sent).toHaveLength(0);
  });

  it("takes the token out of the address bar but still sends it", async () => {
    renderAt("/claim?token=tok-123");

    await waitFor(() => expect(screen.getByTestId("search")).toHaveTextContent(""));
    await fillIn(GOOD_PASSWORD);
    await waitFor(() =>
      expect(sent).toEqual([{ token: "tok-123", newPassword: GOOD_PASSWORD }]),
    );
  });

  it("carries the merchant's name, not GridCore's", () => {
    renderAt("/claim?token=tok-123");
    expect(screen.getByText(/Acme Power account is ready/i)).toBeInTheDocument();
  });

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

  it("puts the server's refusal on the input and leaves the form usable", async () => {
    rejectsWith(422, {
      code: "password_rejected",
      detail: "Include a digit.",
      errors: [
        { field: "newPassword", code: "password_rejected", message: "Include a digit." },
      ],
    });
    renderAt("/claim?token=tok-123");
    await fillIn(GOOD_PASSWORD);

    expect(await screen.findByText("Include a digit.")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });
});
