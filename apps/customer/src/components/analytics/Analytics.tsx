
import { useUserProfile } from "@/hooks/useUserProfile";
import axiosInstance from "@/utils/axios-instance";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
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
import { Link } from "react-router-dom";
import { Box } from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@gridcore/ui/components/ui/tabs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
);

export enum MeterTypes {
  GSM = "GSM",
  OTHER = "OTHERS",
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Analytics() {
  const { userProfile, refetchProfile } = useUserProfile();
  const [selectedMeter, setSelectedMeter]: any = useState(null);
  const [allMeters, setAllMeters] = useState([]);
  const token = Cookies.get("access_token");
  const fetchUserRemoteMeter = async () => {
    const response = await axiosInstance.get(
      `/meters/analytics/${selectedMeter}`,
    );
    return response.data;
  };

  useEffect(() => {
    if (userProfile) {
      setSelectedMeter(userProfile?.meters[0]?.meterNumber);
      setAllMeters(userProfile?.meters);
    }
  }, [userProfile]);

  const { data, isError, error, isLoading, isRefetching, refetch } = useQuery({
    queryKey: [`/meters/analytics/${selectedMeter}`],
    queryFn: fetchUserRemoteMeter,
    enabled: !!selectedMeter && selectedMeter !== "" && !!token,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  });

  useEffect(() => {}, [data?.data?.meter?.result]);

  const meterData = data?.data?.meter?.remoteMeter?.result?.data || [];
  const matchingRemoteMeters = data?.data?.meter?.matchingRemoteMeters || [];

  const nameCounts = meterData.reduce(
    (acc: Record<string, number>, meter: any) => {
      acc[meter.name] = (acc[meter.name] || 0) + 1;
      return acc;
    },
    {},
  );

  const dataPrefixCounts = meterData.reduce(
    (acc: Record<string, number>, meter: any) => {
      acc[meter.dataPrefix] = (acc[meter.dataPrefix] || 0) + 1;
      return acc;
    },
    {},
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

  const [selectedIndex, setSelectedIndex] = useState(0);

  const tabNames = allMeters
    ?.filter((meter: any) => meter.meterBrand == "GSM")
    ?.map((meter: any) => `Meter: ${meter.meterNumber}`);

  // Radix tabs are addressed by value, not index; the index is the value here
  // so the meter lookup below stays as it was.
  const handleTabChange = (value: string) => {
    const index = Number(value);
    setSelectedIndex(index);
    setSelectedMeter(tabNames[index].split(": ")[1]);
  };

  return (
    <div className="flex flex-col">
      <>
        <Tabs value={String(selectedIndex)} onValueChange={handleTabChange}>
          <TabsList className="flex gap-1 rounded-xl bg-blue-900/20 p-1 mb-4">
            {tabNames?.map((meter: any, index: number) => (
              <TabsTrigger
                key={index}
                value={String(index)}
                className={classNames(
                  "w-32 rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700",
                  "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-hidden focus:ring-2",
                  "data-[state=active]:bg-white data-[state=active]:shadow-sm",
                  "data-[state=inactive]:text-blue-100 data-[state=inactive]:hover:bg-white/[0.12] data-[state=inactive]:hover:text-white",
                )}
              >
                {meter}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="mt-2">
            {tabNames?.map((_tab: any, index: number) => (
                <TabsContent
                  key={index}
                  value={String(index)}
                  className={classNames(
                    "rounded-xl bg-white p-3",
                    "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-hidden focus:ring-2",
                  )}
                >
                  {isLoading ? (
                    <div className="font-bold text-[14px]">Loading...</div>
                  ) : isError ? (
                    <p>Error Loading Readings!</p>
                  ) : (
                    <>
                      {userProfile?.meters[0]?.meterBrand !== MeterTypes.GSM ? (
                        <>
                          <div>Readings not available for this meter type.</div>
                        </>
                      ) : (
                        <>
                          <div className="flex flex-wrap justify-between gap-4">
                            {matchingRemoteMeters?.map((reading: any) => (
                              <div key={reading.id} className="w-[30%]">
                                <section className=" h-[100%] p-8 sm:p-6 rounded-md ring-1 shadow-xs ring-gray-300">
                                  <h2 className="text-md font-medium mb-4">
                                    {reading.name}
                                  </h2>
                                  <div className="text-sm font-bold bg-secondary text-black">
                                    <span>Status - {reading?.status}</span> |
                                    Value -{" "}
                                    <span>
                                      {reading?.data}
                                      {reading?.dataPrefix?.includes("Voltage")
                                        ? "V"
                                        : ""}{" "}
                                    </span>
                                  </div>

                                  <Link
                                    to="/payments"
                                    className="inline-flex items-center gap-x-3 mt-8"
                                  >
                                    <Box
                                      className="h-5 w-5 text-secondary"
                                      aria-hidden="true"
                                    />
                                  </Link>
                                </section>
                              </div>
                            ))}
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
                  )}
                </TabsContent>
            ))}
          </div>
        </Tabs>
        {!isLoading && tabNames?.length == 0 ? (
          <div className="w-[100%] flex justify-center font-[600]">
            METER TYPE DOES NOT SUPPORT MONITORING!
          </div>
        ) : (
          <></>
        )}
      </>
    </div>
  );
}
