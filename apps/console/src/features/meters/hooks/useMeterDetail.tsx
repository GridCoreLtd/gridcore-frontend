import { useState } from "react";

import {
  isError,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { AxiosError, AxiosResponse } from "axios";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { parseApiError, toastMessage } from "@gridcore/api-client";
import axiosInstance from "@/utils/axios-instance";
import { isMeterMetricEnabled } from "../lib";

import {
  gethMeterAnalytics,
  getMeterReadings,
  postMeterPower,
  refreshMeterAnalytics,
} from "../api";
import type { IMeterStats } from "../types";


export const useMetePower = () => {
  const [isActive, setIsActive] = useState(false);
  const powerMutation = useMutation({
    mutationFn: postMeterPower,
    onSuccess(data: any) {
      if (data?.data?.data?.code == 99) {
        setIsActive(!isActive);
        toast.error(data?.data?.data?.reason || data?.message || "done");
      } else {
        toast.success(data?.data?.data?.reason || data?.message || "done");
      }
    },
    onError: (error) => {
      toast.error(toastMessage(parseApiError(error)));
    },
  });

  const togglePower = (meterNumber: string, status: string) => {
    setIsActive(!isActive);
    powerMutation.mutate({ meterId: meterNumber, status });
  };

  return {
    data: powerMutation.data,
    isPending: powerMutation.isPending,
    error: powerMutation.error,
    togglePower,
    isActive,
  };
};

export const useMeterStatus = (meterId: string) => {
  const meterBrand = useSearchParams()[0].get("meterBrand");

  const onlineStatus = useQuery({
    queryKey: [`/meters/online-status/${meterId}`],
    queryFn: () => getMeterReadings(meterId, meterBrand ?? ""),
    enabled: isMeterMetricEnabled(meterBrand ?? ""),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  });

  const isOnline = onlineStatus.data;

  const statusColor = isOnline ? "#15803d" : "#ef4444";
  return {
    isOnline,
    isLoading: onlineStatus.isLoading,
    statusColor,
  };
};

export const useMeterAnalytics = (meterId: string) => {
  const meterBrand = useSearchParams()[0].get("meterBrand");
  const meterAnalytics = useQuery({
    queryKey: [`/meters/analytics/${meterId}`],
    queryFn: () => gethMeterAnalytics(meterId),
    enabled: isMeterMetricEnabled(meterBrand ?? ""),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  });

  return {
    meterAnalytics: meterAnalytics.data?.data?.meter
      ?.latestReading as IMeterStats,
    isLoading: meterAnalytics.isLoading,
    isError: meterAnalytics.isError,
  };
};

export const useRefreshMeterAnalytics = () => {
  const param = useParams();
  const queryClient = useQueryClient();

  const meterAnalytics = useMutation<AxiosResponse<IMeterStats>, AxiosError>({
    mutationFn: () => refreshMeterAnalytics(param.id as string),
    onError: (error) => {
      toast.error(toastMessage(parseApiError(error)));
    },
    onSuccess(data) {
      queryClient.setQueryData([`/meters/analytics/${param.id}`], {
        data: {
          meter: {
            latestReading: data,
          },
        },
      });
    },
  });
  return {
    refresh: meterAnalytics.mutate,
    isLoading: meterAnalytics.isPending,
  };
};

export const useLoadProfile = (meterId: string) => {
  const loadProfile = useQuery({
    queryKey: [`meters/energy-load-profile/${meterId}`],
    queryFn: () => axiosInstance.get(`/meters/energy-load-profile/${meterId}`),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  });

  const loadData = loadProfile.data?.data?.data?.data?.result?.data ?? [];

  return {
    loadProfile: loadData,
    isLoadingProfile: loadProfile.isLoading,
  };
};
