import React from "react";

import Shimmer from "@/components/shared/Shimmer";

type Props = {
  isLoading?: boolean;
};

const EventLog = ({ isLoading }: Props) => {
  return (
    <div className="bg-white p-6 rounded-2xl border shadow-xs">
      <section className="border-b">Event Log</section>
      <div className="py-3">
        {isLoading ? (
          <div className="space-y-2">
            <Shimmer width="60%" height={12} />
            <Shimmer width="80%" height={12} />
          </div>
        ) : (
          <p className="text-xs text-[#6C6C6C]">
            No Tamper Alerts <br />
            All systems operating normally. No tampering detected.
          </p>
        )}
      </div>
    </div>
  );
};

export default EventLog;
