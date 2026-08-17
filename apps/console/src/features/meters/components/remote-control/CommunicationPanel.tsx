
import { BellRing, TrendingUp } from "lucide-react";
import { useParams } from "react-router-dom";

import Shimmer from "@/components/shared/Shimmer";

import { useMeterStatus } from "../../hooks/useMeterDetail";


import SignalStrengthCard from "./SignalStrengthCard";
import StatusRow from "./StatusRow";




type Props = {
  isLoading?: boolean;
};

export default function CommunicationPanel({ isLoading }: Props) {
  const params = useParams();
  const { isOnline, isLoading: isStatusLoading } = useMeterStatus(
    params?.id as string
  );
  const loading = isLoading || isStatusLoading;
  return (
    <div className="bg-white p-6 rounded-2xl border shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Communication</h2>
          <p className="text-sm text-gray-500">Device connectivity status</p>
        </div>

        {/* <p className="text-sm text-gray-500">
          <span className="font-medium text-gray-700">Last Sync:</span> 10:46:45
          AM
        </p> */}
      </div>

      <div className="space-y-4">
        {/* <StatusRow
          icon={<TrendingUp className="h-6 w-6" />}
          label="Concentrator"
          status="online"
        /> */}

        {loading ? (
          <div className="flex items-center gap-4">
            <Shimmer width={24} height={24} rounded="rounded-full" />
            <Shimmer width={100} height={16} />
            <div className="ml-auto">
              <Shimmer width={60} height={24} rounded="rounded-full" />
            </div>
          </div>
        ) : (
          <StatusRow
            icon={<TrendingUp className="h-6 w-6" />}
            label="Meter"
            status={isOnline}
          />
        )}

        {/* <StatusRow
          icon={<BellRing className="h-6 w-6" />}
          label="Meter Tamper Alerts"
          status="ok"
        /> */}
      </div>

      {/* <SignalStrengthCard strength={87} /> */}
    </div>
  );
}
