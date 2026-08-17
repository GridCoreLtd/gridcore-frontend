
import React, { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import type {
  ChartData,
  ChartOptions} from "chart.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";

import SectionLoader from "@/components/shared/SectionLoader";
import axiosInstance from "@/utils/axios-instance";
import { currencyFormatter } from "@/utils/formatters";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CHART_PRIMARY = "#2626FD";
const CHART_SECONDARY = "#9CA3AF"; // Lighter gray for comparison

const MONTH_ORDER = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface GraphCardProps {
  yearA: string;
  yearB: string | null;
}

export default function GraphCard({ yearA, yearB }: GraphCardProps) {
  const { data: dataA, isLoading: loadingA } = useQuery({
    queryKey: ["topup-per-month", yearA],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/analytics/topup-per-month?year=${yearA}`
      );
      return res.data.data.data as { name: string; topup: number }[];
    },
  });

  const { data: dataB, isLoading: loadingB } = useQuery({
    queryKey: ["topup-per-month", yearB!],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/analytics/topup-per-month?year=${yearB}`
      );
      return res.data.data.data as { name: string; topup: number }[];
    },
    enabled: !!yearB,
  });

  const isCompare = !!yearB;
  const isLoading = loadingA || (isCompare && loadingB);

  // Calculate totals and growth
  const { totalA, totalB, growthPercent } = useMemo(() => {
    const tA = (dataA ?? []).reduce((acc, curr) => acc + curr.topup, 0);
    const tB = (dataB ?? []).reduce((acc, curr) => acc + curr.topup, 0);
    const growth = tB > 0 ? ((tA - tB) / tB) * 100 : 0;
    return { totalA: tA, totalB: tB, growthPercent: growth };
  }, [dataA, dataB]);

  const chartData: ChartData<"line"> = useMemo(() => {
    const byMonthA = new Map((dataA ?? []).map((d) => [d.name, d.topup]));
    const byMonthB = new Map((dataB ?? []).map((d) => [d.name, d.topup]));

    const datasets = [];

    // Dataset for Year A
    datasets.push({
      label: yearA,
      data: MONTH_ORDER.map((name) => byMonthA.get(name) ?? 0),
      fill: true,
      borderColor: CHART_PRIMARY,
      borderWidth: 3,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointBackgroundColor: CHART_PRIMARY,
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      tension: 0.45,
      backgroundColor: (context: any) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, "rgba(38, 38, 253, 0.15)");
        gradient.addColorStop(1, "rgba(38, 38, 253, 0)");
        return gradient;
      },
    });

    // Dataset for Year B (if comparing)
    if (isCompare) {
      datasets.push({
        label: yearB,
        data: MONTH_ORDER.map((name) => byMonthB.get(name) ?? 0),
        fill: true,
        borderColor: CHART_SECONDARY,
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 4,
        pointBackgroundColor: CHART_SECONDARY,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        tension: 0.45,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(156, 163, 175, 0.1)");
          gradient.addColorStop(1, "rgba(156, 163, 175, 0)");
          return gradient;
        },
      });
    }

    return {
      labels: MONTH_ORDER,
      datasets,
    };
  }, [dataA, dataB, yearA, yearB, isCompare]);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // We're using a custom legend
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#111827",
        titleFont: {
          weight: "bold",
          size: 14,
        },
        bodyColor: "#4B5563",
        bodyFont: {
          size: 13,
        },
        borderColor: "#F3F4F6",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
        usePointStyle: true,
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += currencyFormatter.format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: 500,
          },
          color: "#9CA3AF",
          padding: 10,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "#F3F4F6",
          drawTicks: false,
          //@ts-expect-error -- borderDash is valid at runtime but missing from
          // chart.js grid typings.
          borderDash: [5, 5],
        },
        ticks: {
          font: {
            size: 12,
            weight: 500,
          },
          color: "#9CA3AF",
          padding: 10,
          callback: (value) => {
            return new Intl.NumberFormat("en-NG", {
              notation: "compact",
              compactDisplay: "short",
            }).format(Number(value));
          },
        },
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
  };

  if (isLoading) {
    return <SectionLoader height={350} />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Custom Legend & Stats */}
      <div className="flex flex-wrap items-center gap-x-12 gap-y-4 mb-8">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{yearA} Performance</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 leading-none">
              {currencyFormatter.format(totalA)}
            </span>
          </div>
        </div>

        {isCompare && (
          <>
            <div className="hidden sm:block w-px h-10 bg-gray-100" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{yearB} Performance</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-gray-400 leading-none">
                  {currencyFormatter.format(totalB)}
                </span>
                <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${growthPercent >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {growthPercent >= 0 ? '↑' : '↓'} {Math.abs(growthPercent).toFixed(1)}%
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex-1 min-h-[300px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
