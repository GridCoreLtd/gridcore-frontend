import type { FC, ReactNode } from "react";
import React from "react";

import Shimmer from "@/components/shared/Shimmer";

interface Props {
  label: string;
  value: string | number;
  icon: ReactNode;
  iconBg?: string; // e.g: "bg-blue-100"
  isLoading?: boolean;
}

const MeterStatCard: FC<Props> = ({ label, value, icon, iconBg, isLoading }) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-white shadow-xs rounded-xl border">
      <div
        className={`w-10 h-10 flex items-center justify-center rounded-lg ${iconBg}`}
      >
        {icon}
      </div>

      <div className="flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        {isLoading ? (
          <Shimmer width={60} height={24} className="mt-1" />
        ) : (
          <p className="text-xl font-semibold">{value}</p>
        )}
      </div>
    </div>
  );
};

export default MeterStatCard;
