import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import InviteMemberSheet from "./InviteMemberSheet";

// jsdom lacks the pointer-capture API Radix Select drives with.
window.HTMLElement.prototype.hasPointerCapture = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();
window.HTMLElement.prototype.scrollIntoView = vi.fn();

/** The transport is stubbed, not the decisions (the house test pattern). */
let sent: unknown[] = [];
let respond: () => Promise<unknown>;

vi.mock("../api", () => ({
  inviteTeamMember: (body: unknown) => {
    sent.push(body);
    return respond();
  },
  listAssignableRoles: () =>
    Promise.resolve({
      data: [
        { id: "r-admin", name: "merchant_admin", displayName: "Admin" },
        { id: "r-staff", name: "merchant_staff", displayName: "Staff" },
      ],
    }),
}));

const resolves = () => {
  respond = () => Promise.resolve({ membershipId: "m-1" });
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

function renderSheet() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <InviteMemberSheet open onOpenChange={() => {}} />
    </QueryClientProvider>,
  );
}

async function fill(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("First name"), "Bisi");
  await user.type(screen.getByLabelText("Last name"), "Adebayo");
  await user.type(screen.getByLabelText("Phone"), "+2348077000001");
  await user.type(screen.getByLabelText("Email"), "bisi@team.test");
  await user.click(screen.getByRole("combobox"));
  await user.click(await screen.findByRole("option", { name: "Staff" }));
}

beforeEach(() => {
  sent = [];
  resolves();
});

describe("InviteMemberSheet", () => {
  it("sends the four fields and the picked role id — never a role name", async () => {
    renderSheet();
    const user = userEvent.setup();

    await fill(user);
    await user.click(screen.getByRole("button", { name: "Send invite" }));

    await waitFor(() => expect(sent).toHaveLength(1));
    expect(sent[0]).toEqual({
      firstName: "Bisi",
      lastName: "Adebayo",
      phone: "+2348077000001",
      email: "bisi@team.test",
      roleId: "r-staff",
    });
  });

  it("shows the combined contact-taken answer without saying whose", async () => {
    rejectsWith(422, {
      code: "contact_taken",
      detail: "That phone number or email is already in use.",
    });
    renderSheet();
    const user = userEvent.setup();

    await fill(user);
    await user.click(screen.getByRole("button", { name: "Send invite" }));

    expect(
      await screen.findByText(/already in use/),
    ).toBeInTheDocument();
  });

  it("refuses to submit without a role", async () => {
    renderSheet();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("First name"), "Bisi");
    await user.type(screen.getByLabelText("Last name"), "Adebayo");
    await user.type(screen.getByLabelText("Phone"), "+2348077000001");
    await user.type(screen.getByLabelText("Email"), "bisi@team.test");
    await user.click(screen.getByRole("button", { name: "Send invite" }));

    expect(await screen.findByText("Choose a role")).toBeInTheDocument();
    expect(sent).toHaveLength(0);
  });
});
