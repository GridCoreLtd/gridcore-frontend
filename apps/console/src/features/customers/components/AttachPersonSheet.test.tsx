import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AttachPersonSheet from "./AttachPersonSheet";

/** NewCustomerSheet's pattern: the transport is stubbed, not the decisions. */
let sent: { customerId: string; body: unknown }[] = [];
let respond: () => Promise<unknown>;

vi.mock("../api", () => ({
  attachPerson: (customerId: string, body: unknown) => {
    sent.push({ customerId, body });
    return respond();
  },
}));

const resolves = () => {
  respond = () => Promise.resolve(undefined);
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
      <AttachPersonSheet
        customerId="c-77"
        customerName="Mama Nkechi (Shop 4)"
        open
        onOpenChange={() => {}}
      />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  sent = [];
  resolves();
});

describe("AttachPersonSheet", () => {
  it("sends the four contact fields to the named customer", async () => {
    renderDialog();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("First name"), "Ubani");
    await user.type(screen.getByLabelText("Last name"), "Okoro");
    await user.type(screen.getByLabelText("Phone"), "+2348055000001");
    await user.type(screen.getByLabelText("Email"), "ubani@example.test");
    await user.click(screen.getByRole("button", { name: "Add details" }));

    await waitFor(() => expect(sent).toHaveLength(1));
    expect(sent[0].customerId).toBe("c-77");
    expect(sent[0].body).toEqual({
      firstName: "Ubani",
      lastName: "Okoro",
      phone: "+2348055000001",
      email: "ubani@example.test",
    });
  });

  it("lands a taken contact under its fields, never disclosing whose it is", async () => {
    rejectsWith(422, {
      code: "validation_failed",
      errors: [
        { field: "phone", code: "contact_taken", message: "already in use" },
        { field: "email", code: "contact_taken", message: "already in use" },
      ],
    });
    renderDialog();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("First name"), "Ubani");
    await user.type(screen.getByLabelText("Last name"), "Okoro");
    await user.type(screen.getByLabelText("Phone"), "+2348055000001");
    await user.type(screen.getByLabelText("Email"), "ubani@example.test");
    await user.click(screen.getByRole("button", { name: "Add details" }));

    await waitFor(() =>
      expect(screen.getAllByText("already in use")).toHaveLength(2),
    );
  });
});
