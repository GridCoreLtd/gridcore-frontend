import { useMemo } from "react";

import type { ChartPoint, LoadProfileItem } from "../types";

export const useLoadProfileChartData = (
  loadProfileArray: LoadProfileItem[]
) => {
  const chartData = useMemo<ChartPoint[]>(() => {
    if (!Array.isArray(loadProfileArray)) return [];

    return loadProfileArray.map((item) => ({
      time: new Date(item.currentDate).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      power: Number(item.totalActivePower) || 0,
      voltage: Number(item.instantaneousVoltage) || 0,
      current: Number(item.instantaneousCurrent) || 0,
    }));
  }, [loadProfileArray]);

  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return {
        peak: 0,
        avg: 0,
        min: 0,
      };
    }

    const values = chartData.map((d) => d.power);
    const peak = Math.max(...values);
    const min = Math.min(...values);
    const avg = values.reduce((sum, v) => sum + v, 0) / (values.length || 1);

    return {
      peak,
      min,
      avg: Number(avg.toFixed(2)),
    };
  }, [chartData]);

  return { chartData, stats };
};
