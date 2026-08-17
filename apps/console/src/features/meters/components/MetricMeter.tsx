import React from "react";

import { useMeterAnalytics } from "../hooks/useMeterDetail";
import { MeterTypes } from "../types";

import CommunicationPanel from "./remote-control/CommunicationPanel";
import EventLog from "./remote-control/EventLog";
import LoadProfileChart from "./remote-control/LoadProfileChart";
import MeterCredit from "./remote-control/MeterCredit";
import MeterPower from "./remote-control/MeterPower";
import MeterStats from "./remote-control/MeterStats";



type Props = {
  meterId: string;
  meterBrand: MeterTypes;
};

const MetricMeter = (props: Props) => {
  const { isLoading, meterAnalytics } = useMeterAnalytics(props.meterId);

  return (
    <section>
      <div className="mt-10 grid md:grid-cols-2 gap-5">
        <MeterPower />
        <MeterCredit
          value={meterAnalytics?.residualAmount ?? "0"}
          unit={"kwh"}
          isLoading={isLoading}
        />
      </div>

      <MeterStats meterStats={meterAnalytics} isLoading={isLoading} />

      {(props.meterBrand === MeterTypes.GSM ||
        props.meterBrand === MeterTypes.LORA ||
        props.meterBrand === MeterTypes.CALIN) && <LoadProfileChart />}

      <section className="grid md:grid-cols-2 gap-5 mt-10">
        <CommunicationPanel isLoading={isLoading} />
        <EventLog isLoading={isLoading} />
      </section>
    </section>
  );
};

export default MetricMeter;
