
import { useEffect, useState } from "react";


import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js";
import { Box, ChevronLeft, Eye } from "lucide-react";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Link , useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import Button from "@gridcore/ui/components/Button";
import SlideOver from "@gridcore/ui/components/overlays/SlideOver";
import StatusIndicator from "@/components/shared/StatusIndicator";
import axiosInstance from "@/utils/axios-instance";

import { MeterTypes } from "../../types";
import { ClearMeterTamper } from "../ClearMeterTamper";
import { VendMeter } from "../VendMeter";


import { MeterDetails } from "./MeterDetails";


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement
);


export default function Analytics() {
  const params = useParams();
  const [query] = useSearchParams();
  const [topUpMeter, setTopUpMeter] = useState(false);
  const [clearMeterTamper, setClearMeterTamper] = useState(false);
  const [cardDetails, setCardDetails] = useState<any>({});
  const [openCardDetails, setOpenCardDetails] = useState(false);
  const [powerAction, setPowerAction] = useState("");

  const meterBrand = query.get("meterBrand");

  const isMetricsEnabled =
    meterBrand === MeterTypes.GSM ||
    meterBrand === MeterTypes.LORA ||
    meterBrand === MeterTypes.CALIN;

  const fetchUserRemoteMeter = async () => {
    const response = await axiosInstance.get(
      `/meters/analytics/${params.id ?? "47004044047"}`
    );
    return response.data;
  };

  const { data, isError, isLoading } = useQuery({
    queryKey: [`/meters/analytics/${params.id}`],
    queryFn: fetchUserRemoteMeter,
    enabled: !!isMetricsEnabled,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  });

  const fetchUserRemoteReadings = async () => {
    const response = await axiosInstance.get(
      `/meters/gprs-online-status/${params.id ?? "47004044047"}`
    );
    return response.data;
  };

  const {
    data: meterReadings,
    isError: isErrorR,
    isLoading: isLoadingR,
  } = useQuery({
    queryKey: [`/meters/gprs-online-status/${params.id ?? "47004044047"}`],
    queryFn: fetchUserRemoteReadings,
    enabled: !!isMetricsEnabled,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  });

  const powerMutation = useMutation({
    mutationFn: async (reqData) => {
      return axiosInstance.post("api-merchant/meter/power-control", reqData);
    },
    onSuccess(data: any) {
      setPowerAction("");
      if (data?.data?.data?.data?.code == 99) {
        toast.error(
          data?.data?.data?.data?.reason || data?.data?.message || "done"
        );
      } else {
        toast.success(
          data?.data?.data?.data?.reason || data?.data?.message || "done"
        );
      }
    },
  });

  const viewDetails = useMutation({
    mutationFn: async (reqData: any) => {
      return axiosInstance.post(
        `meters/remote-task/${params.id}/${reqData.id}`,
        reqData
      );
    },
    onSuccess(data: any) {
      const resD = data?.data?.data?.remoteReading?.result?.data?.[0];
      if (resD) {
        setOpenCardDetails(true);
        setCardDetails(
          data?.data?.data?.remoteReading?.result?.data?.[0] ?? {}
        );
        toast.success(
          data?.data?.data?.data?.reason || data?.data?.message || "done"
        );
      } else {
        toast.error("error fetching details");
      }
    },
  });

  const meterControl = (status: string) => {
    if (!isMetricsEnabled) {
      toast.error("Meter Brand not supported!!");
      return;
    }
    setPowerAction(status);
    powerMutation.mutate({
      meterNumber: params?.id ?? "47004044047",
      status,
    } as any);
  };

  const temperMeterControl = () => {
    setClearMeterTamper(true);
  };

  const viewCrd = (id: string) => {
    viewDetails.mutate({
      id,
    } as any);
  };

  useEffect(() => {}, [data?.data?.meter?.result]);

  const meterData = data?.data?.meter?.remoteMeter?.result?.data || [];
  const meterDetails = data?.data?.meter?.meterDetails?.result?.data || [];
  const matchingRemoteMeters = data?.data?.meter?.matchingRemoteMeters || [];

  const nameCounts = meterData.reduce(
    (acc: Record<string, number>, meter: any) => {
      acc[meter.name] = (acc[meter.name] || 0) + 1;
      return acc;
    },
    {}
  );

  const dataPrefixCounts = meterData.reduce(
    (acc: Record<string, number>, meter: any) => {
      acc[meter.dataPrefix] = (acc[meter.dataPrefix] || 0) + 1;
      return acc;
    },
    {}
  );

  const createDateCounts = meterData.reduce(
    (acc: Record<string, number>, meter: any) => {
      const date = new Date(meter.createDate).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    },
    {}
  );

  const colorPalette = [
    "#ff6384",
    "#36a2eb",
    "#cc65fe",
    "#ffce56",
    "#4bc0c0",
    "#9966ff",
    "#ff9f40",
    "#ffcd56",
    "#c9cbcf",
    "#ff6384",
    "#36a2eb",
    "#cc65fe",
    "#ffce56",
    "#4bc0c0",
    "#9966ff",
    "#ff9f40",
    "#ffcd56",
    "#c9cbcf",
  ];

  const chartData = {
    labels: Object.keys(nameCounts),
    datasets: [
      {
        label: "Frequency",
        data: Object.values(nameCounts),
        backgroundColor: colorPalette,
        borderColor: colorPalette,
        borderWidth: 1,
      },
    ],
  };

  const lineChartData = {
    labels: Object.keys(createDateCounts),
    datasets: [
      {
        label: "Updates Over Time",
        data: Object.values(createDateCounts),
        fill: false,
        backgroundColor: "#36a2eb",
        borderColor: "#36a2eb",
        borderWidth: 1,
      },
    ],
  };

  const pieChartData = {
    labels: Object.keys(dataPrefixCounts),
    datasets: [
      {
        data: Object.values(dataPrefixCounts),
        backgroundColor: colorPalette,
        borderColor: colorPalette,
        borderWidth: 1,
      },
    ],
  };

  const meterOnline = meterReadings?.data?.result?.data[0]?.isOnline;

  return (
    <div className="flex flex-col">
      <Link
        to="/meters"
        className=" inline-flex space-x-1.5 text-primary mb-10"
      >
        <ChevronLeft className="h-4 w-4 mt-[1.6px] text-primary" />
        <span>Go Back</span>
      </Link>

      {isLoadingR ? (
        <>
          {!isMetricsEnabled ? (
            <>Power Control only available to GSM/LORA Meters</>
          ) : (
            <>
              <img
                src="/icons/loading-black.png"
                alt="Spinner"
                className="w-4 h-4 animate-spin"
              />
              Loading...
            </>
          )}
        </>
      ) : !meterReadings ? (
        <>Unable to fetch!</>
      ) : (
        <StatusIndicator isOnline={meterOnline ? true : false} />
      )}

      <div className="flex gap-2 mb-4">
        <Button
          type="submit"
          text="Turn ON"
          width="100%"
          isLoading={powerAction == "ON" && powerMutation.isLoading}
          onClick={() => meterControl("ON")}
          variant="success"
        />
        <Button
          type="submit"
          text="Turn OFF"
          width="100%"
          isLoading={powerAction == "OFF" && powerMutation.isLoading}
          onClick={() => meterControl("OFF")}
          variant="destructive"
        />
        <Button
          type="submit"
          text="Clear Tamper"
          width="100%"
          onClick={() => temperMeterControl()}
          isLoading={false}
        />
      </div>
      <>
        {!isMetricsEnabled ? (
          <>
            <div>Readings not available for this meter type.</div>
          </>
        ) : isLoading ? (
          <div className="font-bold text-[14px]">Loading...</div>
        ) : isError ? (
          <p>Error Loading Readings!</p>
        ) : (
          <>
            <div className="flex flex-col md:flex-row flex-wrap justify-between gap-4">
              {matchingRemoteMeters?.map((reading: any) => (
                <div key={reading?.id} className="md:w-[30%] w-[100%]">
                  <section className="flex flex-col justify-between items-start h-[120px] p-2 sm:p-4 rounded-md ring-1 shadow-xs ring-gray-300">
                    <h2 className="text-md font-medium mb-4">
                      {reading?.name}
                    </h2>

                    <div className="flex items-center gap-4">
                      <div
                        onClick={() => viewCrd(reading?.id)}
                        className="inline-flex items-center gap-x-3 cursor-pointer"
                      >
                        <Eye
                          className="h-4 w-5 text-primary"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="text-sm font-bold text-primary">
                        <span>Status - {reading?.status}</span> | Value -{" "}
                        <span>{reading?.data ?? "N/A"}</span>
                      </div>
                    </div>
                  </section>
                </div>
              ))}
            </div>
            <div className="my-5">
              <MeterDetails meterDetails={meterDetails[0]} />
            </div>
            <div className="w-full h-96">
              <Bar data={chartData} options={{ maintainAspectRatio: false }} />
            </div>
            <div className="w-full h-96 mt-4">
              <Line
                data={lineChartData}
                options={{ maintainAspectRatio: false }}
              />
            </div>
            <div className="w-full h-96 mt-4">
              <Pie
                data={pieChartData}
                options={{ maintainAspectRatio: false }}
              />
            </div>
          </>
        )}
      </>
      {topUpMeter && (
        <SlideOver title="Vend Meter" open={topUpMeter} setOpen={setTopUpMeter}>
          <VendMeter
            meterId={params?.id as string}
            closeSlideOver={() => setTopUpMeter(false)}
          />
        </SlideOver>
      )}
      {clearMeterTamper && (
        <SlideOver
          title="Clear Meter Tamper"
          open={clearMeterTamper}
          setOpen={setClearMeterTamper}
        >
          <ClearMeterTamper
            meterId={params?.id as string}
            closeSlideOver={() => setClearMeterTamper(false)}
            meterBrand={meterBrand ?? ""}
          />
        </SlideOver>
      )}
      {openCardDetails && (
        <SlideOver
          title="Details"
          open={openCardDetails}
          setOpen={setOpenCardDetails}
        >
          <div className="flex flex-col items-center justify-between p-4 border border-gray-300 rounded-lg bg-white shadow-md">
            <div className="flex flex-col mb-4">
              <div className="text-sm font-medium text-gray-600">
                {cardDetails?.dataPrefix}
              </div>
            </div>

            <div className="w-[100%] flex justify-between items-between space-x-2">
              <div className="text-gray-500">Status</div>
              <div className="text-xl font-semibold text-blue-500">
                {cardDetails?.status ?? "N/A"}
              </div>
            </div>

            <div className="w-full flex justify-between items-center space-x-2">
              <span className="text-gray-500">Data</span>
              <span className="text-xl font-semibold text-blue-500">
                {cardDetails?.data ?? "N/A"}
              </span>
            </div>
          </div>
        </SlideOver>
      )}
    </div>
  );
}
