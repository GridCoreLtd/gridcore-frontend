import type { FC } from "react";
import React from "react";

import MeterStatCard from "./MeterStatCard";

import { } from "date-fns";
import type { IMeterStats } from "../../types";

import { timeAgo } from "@/utils/formatters";

import { useRefreshMeterAnalytics } from "../../hooks/useMeterDetail";

import { ChartColumn, RefreshCw, Zap, ZapOff } from "lucide-react";

type Props = {
  meterStats: IMeterStats;
  isLoading?: boolean;
};

const MeterStats: FC<Props> = ({ meterStats, isLoading }) => {
  const { refresh, isLoading: isRefreshing } = useRefreshMeterAnalytics();
  return (
    <div className="mt-5">
      <section className="flex items-center gap-x-5 flex-wrap gap-y-3">
        <div>
          <p className="font-semibold">Live Metrics</p>
          <span className="text-sm text-[#6C6C6C]">
            Last updated:{" "}
            {meterStats?.fetchedAt ? timeAgo(meterStats.fetchedAt) : "N/A"}
          </span>
        </div>
        <button
          title="Refresh"
          onClick={() => refresh()}
          className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <RefreshCw
            className={`w-5 h-5 ml-3 ${isRefreshing ? "animate-spin text-gray-400" : "text-gray-600"
              }`}
          />
        </button>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        <MeterStatCard
          label={`Voltage (V)`}
          value={meterStats?.voltage ?? 0}
          icon={<Zap className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-100"
          isLoading={isLoading}
        />

        <MeterStatCard
          label={`Active Power (W)`}
          value={meterStats?.activePower ?? 0}
          icon={<ZapOff className="w-5 h-5 text-purple-600" />}
          iconBg="bg-purple-100"
          isLoading={isLoading}
        />

        <MeterStatCard
          label={`Current (A)`}
          value={meterStats?.current ?? 0}
          icon={<ChartColumn className="w-5 h-5 text-green-600" />}
          iconBg="bg-green-100"
          isLoading={isLoading}
        />

        <MeterStatCard
          label={`Total Consumption (kWh)`}
          value={meterStats?.activeEnergy ?? 0}
          icon={<ChartColumn className="w-5 h-5 text-green-600" />}
          iconBg="bg-green-100"
          isLoading={isLoading}
        />
      </section>
    </div>
  );
};

export default MeterStats;
