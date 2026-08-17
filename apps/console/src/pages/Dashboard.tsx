
import { Switch } from "@gridcore/ui/components/ui/switch";
import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { useScopes } from "@/auth/useScopes";
import SelectInput from "@/components/shared/SelectInput";
import { GraphCard, StatCards } from "@/features/dashboard";
import axiosInstance from "@/utils/axios-instance";
import { formatCurrency } from "@gridcore/ui/lib/format";
import { getYearSelectOptions } from "@/utils/year-options";

const yearOptions = getYearSelectOptions();

export default function Dashboard() {
  const currentYear = new Date().getFullYear();
  const [statsYear, setStatsYear] = useState<string>(String("All"));
  const [chartYearA, setChartYearA] = useState<string>(String(currentYear));
  const [chartYearB, setChartYearB] = useState<string | null>(null);

  const { isMerchant } = useScopes();

  // A merchant has one wallet and it belongs to them; an operator has no single
  // balance to show, so the lookup is skipped rather than fetched and discarded.
  const { data: merchant } = useQuery({
    queryKey: ["merchant-me"],
    enabled: isMerchant,
    queryFn: async () => {
      const res = await axiosInstance.get("/merchants/me");
      return res.data.data;
    },
  });

  return (
    <main className="container">
      <div className="flex flex-wrap sm:flex-nowrap gap-2 justify-between">
        <h2 className="text-2xl font-medium">Dashboard</h2>

        {merchant && (
          <div className="flex items-center justify-center card-shadow bg-white px-5 py-2.5 text-primary text-sm">
            <span>Available Balance:</span>
            <span className="ml-1 font-medium">
              {formatCurrency({ country: merchant?.countryCode, currency: merchant?.currencyCode, amount: merchant?.wallet?.balance || 0 })}
            </span>
          </div>
        )}
      </div>

      <div className="mt-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-gray-900">Overview</h3>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.65rem] font-bold text-primary uppercase tracking-wider">
                {statsYear}
              </span>
            </div>
            <p className="text-sm text-gray-500">Quick summary of your business performance metrics.</p>
          </div>

          <div className="flex items-center gap-4 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 px-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Year:</span>
              <div className="w-[6.5rem]">
                <SelectInput
                  id="stats-year"
                  options={[{ value: "All", label: "All" }, ...yearOptions]}
                  placeholder="Year"
                  value={statsYear as any}
                  onChange={(v: unknown) => {
                    const year = typeof v === "string" ? v : (v as { value?: string })?.value;
                    if (year != null) setStatsYear(year);
                  }}
                  isSearchable={false}
                />
              </div>
            </div>
          </div>
        </div>
        <StatCards year={statsYear} />
      </div>

      <div className="mt-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Topups per month
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Monitor your monthly topup performance and trends.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 px-2 border-r border-gray-200">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Year:
              </span>
              <div className="w-[6.5rem]">
                <SelectInput
                  id="chart-year-a"
                  options={yearOptions}
                  placeholder="Year"
                  value={chartYearA as any}
                  onChange={(v: unknown) => {
                    const year =
                      typeof v === "string"
                        ? v
                        : (v as { value?: string })?.value;
                    if (year != null) setChartYearA(year);
                  }}
                  isSearchable={false}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 px-2">
              <label className="inline-flex cursor-pointer items-center gap-2">
                <Switch
                  checked={!!chartYearB}
                  onCheckedChange={(on) =>
                    // Default to the previous year when comparison is switched on.
                    setChartYearB(on ? String(Number(chartYearA) - 1) : null)
                  }
                />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Compare
                </span>
              </label>

              {chartYearB && (
                <div className="w-[6.5rem] animate-in fade-in slide-in-from-left-2 duration-200">
                  <SelectInput
                    id="chart-year-b"
                    options={yearOptions.filter((o) => o.value !== chartYearA)}
                    placeholder="Compare"
                    value={chartYearB as any}
                    onChange={(v: unknown) => {
                      const year =
                        typeof v === "string"
                          ? v
                          : (v as { value?: string })?.value;
                      if (year) setChartYearB(year);
                    }}
                    isSearchable={false}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full border border-gray-100 shadow-xs rounded-xl p-6 bg-white">
          <GraphCard yearA={chartYearA} yearB={chartYearB} />
        </div>
      </div>
    </main>
  );
}
