import { Checkbox } from "@gridcore/ui/components/ui/checkbox";
import React, { useEffect, useMemo, useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { boolean, number, object } from "yup";
import type { ObjectSchema } from "yup";

import Button from "@gridcore/ui/components/Button";
import Textfield from "@/components/shared/Textfield";
import { applyFieldErrors, parseApiError, toastMessage } from "@gridcore/api-client";
import axiosInstance from "@/utils/axios-instance";

interface ApplySiteChargeAdminProps {
  closeSlideOver: () => void;
  merchantId: string;
  selectedSite: any;
  currencyCode?: string;
}

type CustomerRow = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  siteAmountOwed?: number;
};

interface ChargeForm {
  amount: number;
  applyToAll: boolean;
}

const DEBOUNCE_MS = 350;
const PAGE_SIZE = 10;

function useDebounced<T>(value: T, ms = DEBOUNCE_MS) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export const ApplySiteChargeAdmin = ({
  closeSlideOver,
  merchantId,
  selectedSite,
  currencyCode = "",
}: ApplySiteChargeAdminProps) => {
  const queryClient = useQueryClient();

  const validationSchema: ObjectSchema<ChargeForm> = object({
    amount: number()
      .typeError("Amount is required")
      .required("Amount is required")
      .moreThan(0, "Enter a valid amount"),
    applyToAll: boolean().required().default(true),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    setError,
    getValues,
  } = useForm<ChargeForm>({
    resolver: yupResolver(validationSchema),
    mode: "onBlur",
    defaultValues: { amount: undefined as unknown as number, applyToAll: true },
  });

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search, DEBOUNCE_MS);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const applyToAll = watch("applyToAll");

  const CUSTOMERS_KEY = [
    "site-customers",
    merchantId,
    selectedSite?.id,
    debouncedSearch,
    page,
  ];

  const { data, isLoading } = useQuery({
    queryKey: CUSTOMERS_KEY,
    queryFn: async () => {
      const res = await axiosInstance.get(`/users`, {
        params: {
          accountType: "customer",
          merchantId,
          siteId: selectedSite?.id,
          search: debouncedSearch,
          page,
          perPage: PAGE_SIZE,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(selectedSite?.id),
    keepPreviousData: true,
  });

  const rows: CustomerRow[] = useMemo(() => data?.data ?? [], [data]);
  const total = data?.meta?.total ?? rows.length;
  const currentPage = data?.meta?.currentPage ?? page;
  const totalPages = data?.meta?.lastPage ?? 1;

  useEffect(() => {
    if (applyToAll) setSelected({});
  }, [applyToAll]);

  const toggleOne = (id: string) =>
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  const allIdsOnPage = useMemo(() => rows.map((r) => r.id), [rows]);

  const selectAllOnPage = () =>
    setSelected((prev) => {
      const next = { ...prev };
      for (const id of allIdsOnPage) next[id] = true;
      return next;
    });

  const clearAll = () => setSelected({});

  const chargeMutation = useMutation({
    mutationFn: async (reqData: any) =>
      axiosInstance.patch(
        `/merchants/site/apply-charge/${selectedSite?.id}`,
        reqData
      ),
    onError: (error: any) => {
      const problem = parseApiError(error);
      // Field errors render under their input; only a failure that maps to
      // nothing gets a toast. See architecture/10-api-errors.md.
      if (applyFieldErrors(problem, setError, Object.keys(getValues() ?? {}))) {
        toast.error(toastMessage(problem));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["merchant-sites", merchantId],
      });
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY });
      toast.success("Charge applied successfully");
      closeSlideOver();
    },
  });

  const onSubmit = (form: ChargeForm) => {
    const uniqueId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}`;
    const reference = `SITE_FEE:${selectedSite?.id}:${uniqueId}`;

    if (form.applyToAll) {
      chargeMutation.mutate({
        amount: form.amount,
        applyToAll: true,
        reference,
      });
      return;
    }

    const userIds = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => k);

    if (!userIds.length) {
      toast.info("Select at least one customer or toggle Apply to all");
      return;
    }

    chargeMutation.mutate({
      amount: form.amount,
      applyToAll: false,
      userIds,
      reference,
    });
  };

  const amount = watch("amount");
  const perHead = Number(amount || 0);
  const totalSelected = Object.values(selected).filter(Boolean).length;
  const count = applyToAll ? total : totalSelected;
  const totalPreview = perHead > 0 ? perHead * count : 0;
  const money = (n: number) =>
    `${currencyCode} ${Number(n || 0).toLocaleString()}`.trim();

  return (
    <section>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-5">
          <Textfield
            type="number"
            id="amount"
            label="Enter amount (per customer)"
            placeholder="0.00"
            register={register}
            error={errors.amount?.message}
          />

          <div className="flex items-center justify-between rounded-2xl p-3 ring-1 ring-gray-200">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={applyToAll}
                onCheckedChange={(checked) =>
                  setValue("applyToAll", checked === true, {
                    shouldDirty: true,
                  })
                }
              />
              <span className="text-gray-800">
                Apply to all customers in this site
              </span>
            </label>
            <div className="text-xs">
              <span className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-600">
                {count} {count === 1 ? "customer" : "customers"} • Total ≈{" "}
                <span className="font-semibold">{money(totalPreview)}</span>
              </span>
            </div>
          </div>

          {!applyToAll && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search customers by name, email, phone..."
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={selectAllOnPage}
                  className="rounded-xl px-3 py-2 text-xs bg-primary text-white shadow-xs"
                  title="Select all on this page"
                >
                  Select Page
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded-xl px-3 py-2 text-xs ring-1 ring-gray-300 text-gray-600"
                >
                  Clear
                </button>
              </div>

              <div className="max-h-64 overflow-auto rounded-2xl ring-1 ring-gray-200">
                {isLoading ? (
                  <div className="p-4 text-gray-500 text-sm">
                    Loading customers…
                  </div>
                ) : rows.length === 0 ? (
                  <div className="p-4 text-gray-500 text-sm">
                    No customers found
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {rows.map((u) => {
                      const label =
                        `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() ||
                        u.email ||
                        u.phone ||
                        u.id;
                      const sub = u.email || u.phone || "—";
                      const checked = !!selected[u.id];
                      return (
                        <li
                          key={u.id}
                          className="flex items-center justify-between p-3 hover:bg-gray-50"
                        >
                          <label className="flex items-center gap-3 cursor-pointer">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => toggleOne(u.id)}
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {label}
                              </div>
                              <div className="text-xs text-gray-500">{sub}</div>
                            </div>
                          </label>
                          {typeof u.siteAmountOwed === "number" && (
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                              Owed: {money(u.siteAmountOwed)}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600">
                <button
                  type="button"
                  className="rounded-lg px-2 py-1 ring-1 ring-gray-300 text-gray-600 disabled:opacity-40"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                >
                  Prev
                </button>
                <span>
                  Page {currentPage} of {totalPages} • {total.toLocaleString()}{" "}
                  total
                </span>
                <button
                  type="button"
                  className="rounded-lg px-2 py-1 ring-1 ring-gray-300 text-gray-600 disabled:opacity-40"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-xs">
            <span className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-600">
              Will charge:{" "}
              <b>
                {applyToAll ? "All customers" : `${totalSelected} selected`}
              </b>
            </span>
          </div>

          <Button
            type="submit"
            text="Apply Charge"
            isLoading={chargeMutation.isLoading}
            width="150px"
          />
        </div>
      </form>
    </section>
  );
};
