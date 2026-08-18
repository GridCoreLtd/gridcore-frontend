import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import CustomerDetail from "./CustomerDetail";

import type { CustomerDetail as Detail } from "@/features/customers";

/** The two shapes D-064 gives the screen: person-backed and offline. */
let detail: Detail;

vi.mock("@/features/customers/api", () => ({
  getCustomer: () => Promise.resolve(detail),
  attachPerson: () => Promise.resolve(undefined),
}));

const base: Detail = {
  id: "c-77",
  status: "ACTIVE",
  merchantName: "Alpha Power",
  siteName: "DEFAULT",
  createdAt: "2023-04-12T00:00:00Z",
  hasAccount: false,
  meters: [],
};

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/customers/c-77"]}>
        <Routes>
          <Route path="/customers/:id" element={<CustomerDetail />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("CustomerDetail", () => {
  it("says why an offline customer has no contact, and offers the attach", async () => {
    detail = { ...base, displayName: "Mama Nkechi (Shop 4)" };
    renderPage();

    expect(
      await screen.findByRole("heading", { name: "Mama Nkechi (Shop 4)" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Offline — no contact details/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add contact details/ })).toBeInTheDocument();
  });

  it("shows a person's contact and their portal standing instead", async () => {
    detail = {
      ...base,
      firstName: "Ada",
      lastName: "Adeyemi",
      phone: "+2348066000001",
      email: "ada@example.test",
      hasAccount: true,
      meters: [
        {
          meterNumber: "MTR-1",
          commodity: "ELECTRICITY",
          comms: "GSM",
          tariffIndex: 3,
          tariffRateMinor: 22550,
          siteName: "DEFAULT",
          assignedFrom: "2024-01-05T00:00:00Z",
        },
      ],
    };
    renderPage();

    expect(await screen.findByRole("heading", { name: "Ada Adeyemi" })).toBeInTheDocument();
    expect(screen.getByText("+2348066000001")).toBeInTheDocument();
    expect(screen.getByText("Can sign in on the merchant portal")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Add contact details/ })).toBeNull();
    expect(screen.getByText("MTR-1")).toBeInTheDocument();
  });
});
