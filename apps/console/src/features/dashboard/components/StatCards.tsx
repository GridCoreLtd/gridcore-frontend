
import type React from "react";

import { useQuery } from "@tanstack/react-query";
import { Banknote, Calculator, ChartColumnIncreasing, ChartPie, Store, Users } from "lucide-react";

import SectionLoader from "@/components/shared/SectionLoader";
import axiosInstance from "@/utils/axios-instance";
import { shortCurrencyFormatter } from "@/utils/formatters";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg,
}) => (
  <div className="group relative bg-white border border-gray-100 rounded-xl p-3 xl:p-4 shadow-xs transition-all duration-300 ease-out">
    <div className="flex items-center gap-2.5 xl:gap-3 min-w-0">
      <div
        className={`${iconBg} ${iconColor} p-2 xl:p-2.5 rounded-lg shrink-0 transition-transform duration-300 group-hover:scale-110`}
      >
        <Icon className="w-4 h-4 xl:w-5 xl:h-5" />
      </div>
      <div className="flex flex-col text-left min-w-0">
        <span className="text-[0.6rem] xl:text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider mb-0.5 leading-tight">
          {label}
        </span>
        <span
          className="text-base xl:text-lg font-black text-gray-900 tabular-nums leading-tight"
          title={String(value)}
        >
          {value}
        </span>
      </div>
    </div>
  </div>
);

interface StatCardsProps {
  year?: string;
}

export default function StatCards({ year }: StatCardsProps) {
  const statsYear = year ?? String(new Date().getFullYear());

  const {
    data: stats,
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: ["summary", statsYear],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/analytics/summary?year=${statsYear}`,
      );
      return res.data.data;
    },
  });

  // The summary is scoped to the caller, so a merchant's payload simply omits
  // the platform-wide figures. Rendering off field presence keeps this one
  // component for both audiences.
  const cards = [
    {
      label: "Total Merchants",
      value: stats?.totalMerchants,
      icon: Store,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      label: "Total Customers",
      value: stats?.totalCustomers,
      icon: Users,
      iconColor: "text-secondary",
      iconBg: "bg-secondary/10",
    },
    {
      label: "Total Meters",
      value: stats?.totalMeters,
      icon: Calculator,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
    },
    {
      label: "Total Topups",
      value: stats?.totalTopups,
      icon: ChartPie,
      iconColor: "text-pink-600",
      iconBg: "bg-pink-50",
    },
    {
      label: "Total Amount",
      value:
        stats?.totalTopupAmount == null
          ? undefined
          : shortCurrencyFormatter.format(stats.totalTopupAmount),
      icon: ChartColumnIncreasing,
      iconColor: "text-orange-500",
      iconBg: "bg-orange-50",
    },
    {
      label: "Total Commission",
      value:
        stats?.totalCommission == null
          ? undefined
          : shortCurrencyFormatter.format(stats.totalCommission),
      icon: Banknote,
      iconColor: "text-green-600",
      iconBg: "bg-green-50",
    },
  ].filter((c) => c.value !== undefined && c.value !== null);

  return (
    <section>
      {isLoading && <SectionLoader height={100} />}

      {isSuccess && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-3 xl:gap-4">
          {cards.map((c) => (
            <StatCard
              key={c.label}
              label={c.label}
              value={c.value as string | number}
              icon={c.icon}
              iconColor={c.iconColor}
              iconBg={c.iconBg}
            />
          ))}
        </div>
      )}
    </section>
  );
}
