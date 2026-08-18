import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import NewCustomerSheet from "./NewCustomerSheet";

/**
 * What this dialog decides is the SHAPE of the request — the toggle sends
 * contact details or a display name, never both — and where a server's field
 * error lands. The transport is stubbed, not the decisions (ClaimForm's
 * pattern: a plain stub, never vi.fn, so a rejection is not stranded).
 */
let sent: unknown[] = [];
let respond: () => Promise<unknown>;

vi.mock("../api", () => ({
  createCustomer: (body: unknown) => {
    sent.push(body);
    return respond();
  },
}));

const resolves = () => {
  respond = () => Promise.resolve({ id: "c-1" });
};

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

function renderDialog() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <NewCustomerSheet open onOpenChange={() => {}} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  sent = [];
  resolves();
});

describe("NewCustomerSheet", () => {
  it("sends contact details for the ordinary customer, and no displayName", async () => {
    renderDialog();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("First name"), "Ada");
    await user.type(screen.getByLabelText("Last name"), "Adeyemi");
    await user.type(screen.getByLabelText("Phone"), "+2348030000000");
    await user.type(screen.getByLabelText("Email"), "ada@example.test");
    await user.click(screen.getByRole("button", { name: "Add customer" }));

    await waitFor(() => expect(sent).toHaveLength(1));
    expect(sent[0]).toEqual({
      firstName: "Ada",
      lastName: "Adeyemi",
      phone: "+2348030000000",
      email: "ada@example.test",
    });
  });

  it("sends only the displayName for an offline customer (D-064)", async () => {
    renderDialog();
    const user = userEvent.setup();

    await user.click(screen.getByLabelText("Vended for offline"));
    await user.type(
      screen.getByLabelText("Name you know them by"),
      "Mama Nkechi (Shop 4)",
    );
    await user.click(screen.getByRole("button", { name: "Add customer" }));

    await waitFor(() => expect(sent).toHaveLength(1));
    expect(sent[0]).toEqual({ displayName: "Mama Nkechi (Shop 4)" });
  });

  it("lands a server field error under its field", async () => {
    rejectsWith(422, {
      code: "invalid_phone",
      detail: "One or more fields need attention.",
      errors: [
        {
          field: "phone",
          code: "invalid_phone",
          message: "Enter the phone in international format, e.g. +2348030000000.",
        },
      ],
    });
    renderDialog();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("First name"), "Ada");
    await user.type(screen.getByLabelText("Last name"), "Adeyemi");
    await user.type(screen.getByLabelText("Phone"), "0803");
    await user.type(screen.getByLabelText("Email"), "ada@example.test");
    await user.click(screen.getByRole("button", { name: "Add customer" }));

    expect(
      await screen.findByText(
        "Enter the phone in international format, e.g. +2348030000000.",
      ),
    ).toBeInTheDocument();
  });
});
