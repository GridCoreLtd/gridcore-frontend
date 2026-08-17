import React from "react";

import { Power } from "lucide-react";
import { useParams } from "react-router-dom";

import Shimmer from "@/components/shared/Shimmer";

import {
  useMetePower,
  useMeterStatus,
} from "../../hooks/useMeterDetail";



const MeterPower = () => {
  const params = useParams();
  const { isOnline, isLoading, statusColor } = useMeterStatus(
    params?.id as string
  );
  const { togglePower, isPending } = useMetePower();

  return (
    <>
      <div className="bg-white rounded-2xl p-5 border">
        <section className="bg-gray-100 rounded-sm p-5 py-3 max-w-fit flex items-center gap-3">
          <span className="h-10 w-10 flex items-center justify-center text-red-500 bg-white rounded-sm">
            <Power className="h-5 w-5" />
          </span>
          <div>
            <p className="font-bold">Meter Power</p>
            {isLoading ? (
              <Shimmer width={100} height={20} className="mt-1" />
            ) : (
              <section className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => togglePower(params.id as string, "ON")}
                  disabled={isPending}
                  className="px-4 py-1.5 bg-[#00A63E] text-white text-xs font-semibold rounded-sm shadow-xs hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  Turn ON
                </button>
                <button
                  onClick={() => togglePower(params.id as string, "OFF")}
                  disabled={isPending}
                  className="px-4 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-sm shadow-xs hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  Turn OFF
                </button>
              </section>
            )}
          </div>
        </section>
        <div className="flex items-center gap-2 mt-2">
          {isLoading ? (
            <Shimmer width={80} height={14} />
          ) : (
            <>
              <span
                style={{ backgroundColor: statusColor }}
                className="h-2 w-2 rounded-full"
              ></span>
              <p className="text-xs flex items-center gap-1">
                Status
                <span style={{ color: statusColor }}>
                  {isOnline ? "Active" : "InActive"}
                </span>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MeterPower;
