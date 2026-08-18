import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SiteSheet from "./SiteSheet";

/** NewCustomerSheet's pattern: the transport is stubbed, not the decisions. */
let sent: unknown[] = [];
let respond: () => Promise<unknown>;

vi.mock("../api", () => ({
  createSite: (body: unknown) => {
    sent.push(body);
    return respond();
  },
  updateSite: (siteId: string, body: unknown) => {
    sent.push({ siteId, ...(body as object) });
    return respond();
  },
}));

const resolves = () => {
  respond = () => Promise.resolve({ id: "s-1" });
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
    defaultOptions: { mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <SiteSheet site={null} open onOpenChange={() => {}} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  sent = [];
  resolves();
});

describe("SiteSheet", () => {
  it("sends the create in minor units", async () => {
    renderSheet();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Name"), "Ikeja Estate");
    await user.type(screen.getByLabelText("Address"), "1 Estate Road");
    await user.type(screen.getByLabelText("Default rate (₦)"), "225.50");
    await user.click(screen.getByRole("button", { name: "Add site" }));

    await waitFor(() => expect(sent).toHaveLength(1));
    expect(sent[0]).toEqual({
      name: "Ikeja Estate",
      address: "1 Estate Road",
      tariffRateMinor: 22550,
    });
  });

  it("lands a taken name under its field", async () => {
    rejectsWith(422, {
      code: "validation_failed",
      errors: [
        { field: "name", code: "site_name_taken", message: "You already have a site by that name." },
      ],
    });
    renderSheet();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Name"), "Ikeja Estate");
    await user.type(screen.getByLabelText("Address"), "1 Estate Road");
    await user.type(screen.getByLabelText("Default rate (₦)"), "1");
    await user.click(screen.getByRole("button", { name: "Add site" }));

    await waitFor(() =>
      expect(screen.getByText("You already have a site by that name.")).toBeInTheDocument(),
    );
  });
});
