
import React, { useEffect, useRef, useState } from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useParams } from "react-router-dom";

import Shimmer from "@/components/shared/Shimmer";

import { useLoadProfileChartData } from "../../hooks/useLoadProfileChartData";
import { useLoadProfile } from "../../hooks/useMeterDetail";
import type { LoadProfileItem } from "../../types";


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

type Props = {
  loadProfiles: LoadProfileItem[];
  isLoading: boolean;
};

export default function LoadProfileChart() {
  const params = useParams();
  const { loadProfile: loadProfiles, isLoadingProfile: isLoading } =
    useLoadProfile(params.id as string);

  const chartRef = useRef<any>(null);
  const [gradient, setGradient] = useState<CanvasGradient | null>(null);

  const { chartData, stats } = useLoadProfileChartData(loadProfiles);

  // Extract only the Y values for the dataset
  const dataPoints = chartData.map((d) => d.power);
  const labels = chartData.map((d) => d.time);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = chartRef.current;

    // FIX for Chart.js v4
    const ctx = chart.canvas.getContext("2d");
    if (!ctx) return;

    const gradientFill = ctx.createLinearGradient(0, 0, 0, 300);
    gradientFill.addColorStop(0, "rgba(255,140,0,0.25)");
    gradientFill.addColorStop(1, "rgba(255,140,0,0.03)");

    setGradient(gradientFill);
  }, []);

  const data = {
    labels,
    datasets: [
      {
        label: "Active Power",
        data: dataPoints,
        fill: true,
        backgroundColor: gradient ?? "rgba(255,140,0,0.1)",
        borderColor: "#f59e0b",
        borderWidth: 2,
        tension: 0.45,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        min: 0,
        grid: {
          color: "#e5e7eb",
          drawBorder: false,
        },
        ticks: {
          color: "#6b7280",
          stepSize: 50,
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="p-5 bg-white rounded-2xl shadow-xs border mt-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-sm font-semibold">24-Hour Load Profile</h2>
          <p className="text-xs text-gray-500">Power Consumption</p>
        </div>

        <div className="text-right text-xs text-gray-600 flex items-center gap-7">
          <p>
            Peak:{" "}
            <span className="font-semibold">
              {isLoading ? (
                <Shimmer width={40} height={14} className="inline-block" />
              ) : (
                `${stats.peak} kWh`
              )}
            </span>
          </p>
          <p>
            Avg:{" "}
            <span className="font-semibold">
              {isLoading ? (
                <Shimmer width={40} height={14} className="inline-block" />
              ) : (
                `${stats.avg} kWh`
              )}
            </span>
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        {isLoading ? (
          <Shimmer width="100%" height="100%" />
        ) : (
          <Line ref={chartRef} data={data} options={options} />
        )}
      </div>
    </div>
  );
}
