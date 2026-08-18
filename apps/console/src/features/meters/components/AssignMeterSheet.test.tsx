import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AssignMeterSheet from "./AssignMeterSheet";

/** The drawer decides the VERB — POST for assign, PUT for reassign. */
let sent: { verb: string; meterId: string; customerId: string }[] = [];

vi.mock("../api", () => ({
  assignMeter: (meterId: string, customerId: string) => {
    sent.push({ verb: "assign", meterId, customerId });
    return Promise.resolve();
  },
  reassignMeter: (meterId: string, customerId: string) => {
    sent.push({ verb: "reassign", meterId, customerId });
    return Promise.resolve();
  },
}));

vi.mock("@/entities/customer", () => ({
  CustomerCombobox: ({
    onChange,
  }: {
    onChange: (c: { id: string; name: string }) => void;
  }) => (
    <button type="button" onClick={() => onChange({ id: "c-9", name: "Ada Adeyemi" })}>
      pick-ada
    </button>
  ),
}));

function renderSheet(currentHolder: string | null) {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <AssignMeterSheet
        meterId="m-7"
        meterNumber="MTR-7"
        currentHolder={currentHolder}
        open
        onOpenChange={() => {}}
      />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  sent = [];
});

describe("AssignMeterSheet", () => {
  it("assigns an unheld meter", async () => {
    renderSheet(null);
    const user = userEvent.setup();

    await user.click(screen.getByText("pick-ada"));
    await user.click(screen.getByRole("button", { name: "Assign meter" }));

    await waitFor(() => expect(sent).toHaveLength(1));
    expect(sent[0]).toEqual({ verb: "assign", meterId: "m-7", customerId: "c-9" });
  });

  it("reassigns a held meter and names who loses it", async () => {
    renderSheet("Mama Nkechi (Shop 4)");
    const user = userEvent.setup();

    expect(screen.getByText(/Mama Nkechi \(Shop 4\) holds this meter now/)).toBeInTheDocument();

    await user.click(screen.getByText("pick-ada"));
    await user.click(screen.getByRole("button", { name: "Reassign meter" }));

    await waitFor(() => expect(sent).toHaveLength(1));
    expect(sent[0].verb).toBe("reassign");
  });

  it("refuses to submit without a customer", async () => {
    renderSheet(null);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Assign meter" }));
    expect(await screen.findByText("Choose the customer first.")).toBeInTheDocument();
    expect(sent).toHaveLength(0);
  });
});
