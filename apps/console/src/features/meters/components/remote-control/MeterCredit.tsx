import type { FC } from "react";
import React from "react";

import Shimmer from "@/components/shared/Shimmer";

type Props = {
  value: string;
  unit: string;
  isLoading?: boolean;
};

const MeterCredit: FC<Props> = ({ value, unit, isLoading }) => {
  return (
    <div className="bg-white p-5 text-[#6C6C6C] rounded-2xl border">
      <section className="flex gap-2">
        <span className="gradient-bg h-12 w-12 rounded-sm flex items-center justify-center">
          <svg
            width="30"
            height="30"
            viewBox="0 0 30 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.5 10H12.5"
              stroke="white"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M26.0413 11.25H22.7888C20.5575 11.25 18.75 12.9288 18.75 15C18.75 17.0712 20.5587 18.75 22.7875 18.75H26.0413C26.1463 18.75 26.1975 18.75 26.2413 18.7475C26.9163 18.7063 27.4537 18.2075 27.4975 17.5812C27.5 17.5412 27.5 17.4925 27.5 17.3962V12.6038C27.5 12.5075 27.5 12.4588 27.4975 12.4188C27.4525 11.7925 26.9163 11.2937 26.2413 11.2525C26.1988 11.25 26.1463 11.25 26.0413 11.25Z"
              stroke="white"
              strokeWidth="1.3"
            />
            <path
              d="M26.2063 11.25C26.1088 8.91 25.7962 7.475 24.785 6.465C23.3212 5 20.9637 5 16.25 5H12.5C7.78625 5 5.42875 5 3.965 6.465C2.50125 7.93 2.5 10.2863 2.5 15C2.5 19.7137 2.5 22.0712 3.965 23.535C5.43 24.9987 7.78625 25 12.5 25H16.25C20.9637 25 23.3212 25 24.785 23.535C25.7962 22.525 26.11 21.09 26.2063 18.75"
              stroke="white"
              strokeWidth="1.3"
            />
            <path
              d="M22.4883 15H22.4999"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div className="flex flex-col gap-y-2">
          <span className="text-xs">Remaining Credit</span>
          <p className="text-base leading-3">Residual Amount</p>
        </div>
      </section>
      <div className="mt-3">
        {isLoading ? (
          <div className="flex items-baseline gap-1">
            <Shimmer width={100} height={32} />
            <Shimmer width={40} height={16} />
          </div>
        ) : (
          <p className="text-3xl font-bold">
            {value}
            <span className="text-base font-light">{unit}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default MeterCredit;
