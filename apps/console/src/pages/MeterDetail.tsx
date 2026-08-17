import React from "react";

import { ChevronLeft } from "lucide-react";
import { Link , useParams, useSearchParams } from "react-router-dom";

import {
  GenerateToken,
  MeterTypes,
  MetricMeter,
  NoMetricMeter,
} from "@/features/meters";


const RemoteControl = () => {
  const params = useParams();
  const [query] = useSearchParams();
  const meterBrand = query.get("meterBrand") || "";
  const isMetricEnabled =
    meterBrand === MeterTypes.GSM ||
    meterBrand === MeterTypes.LORA ||
    meterBrand === MeterTypes.CALIN;

  const Metrics = () => {
    if (isMetricEnabled) {
      return (
        <MetricMeter
          meterId={params.id as string}
          meterBrand={meterBrand as MeterTypes}
        />
      );
    }
    return <NoMetricMeter />;
  };

  return (
    <main className="container max-w-full">
      <h2 className="text-2xl font-medium mb-6">Monitoring and Control</h2>
      <div className="sm:flex items-center justify-between space-y-2 gap-x-5">
        <Link
          to="/meters"
          className=" inline-flex space-x-1.5 text-primary"
        >
          <ChevronLeft className="h-4 w-4 mt-[1.6px] text-primary" />
          <span>Go Back</span>
        </Link>
        <GenerateToken meterId={params.id as string} />
      </div>
      {Metrics()}
    </main>
  );
};

export default RemoteControl;
