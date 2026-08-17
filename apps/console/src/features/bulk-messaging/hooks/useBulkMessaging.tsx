
import { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

import { parseApiError, toastMessage } from "@gridcore/api-client";
import axiosInstance from "@/utils/axios-instance";

import type {
  BulkMessagePayload,
  DeliveryChannel,
  MessageLog,
  MessageDetail,
  SelectOption,
} from "../types";

const MERCHANTS_QUERY_KEY = ["bulk-messaging-merchants"];
const CUSTOMERS_QUERY_KEY = ["bulk-messaging-customers"];
const MESSAGE_LOGS_QUERY_KEY = ["bulk-messaging-logs"];

export function useBulkMessaging() {
  const queryClient = useQueryClient();
  const [searchLogs, setSearchLogs] = useState("");

  const { data: merchantsData } = useQuery({
    queryKey: MERCHANTS_QUERY_KEY,
    queryFn: async () => {
      const res = await axiosInstance.get("/merchants?page=1&perPage=500&status=approved");
      const raw = res.data?.data ?? res.data;
      const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
      return list as { id: string; businessName: string }[];
    },
  });

  const { data: customersData } = useQuery({
    queryKey: CUSTOMERS_QUERY_KEY,
    queryFn: async () => {
      const res = await axiosInstance.get("/users?page=1&perPage=500&accountType=customer");
      const raw = res.data?.data ?? res.data;
      const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
      return list as { id: string; firstName?: string; lastName?: string; email?: string }[];
    },
  });

  const merchantOptions: SelectOption[] =
    merchantsData?.map((m) => ({
      value: m.id,
      label: m.businessName ?? m.id,
    })) ?? [];

  const customerOptions: SelectOption[] =
    customersData?.map((c) => ({
      value: c.id,
      label: [c.firstName, c.lastName].filter(Boolean).join(" ") || c.email || c.id,
    })) ?? [];

  const sendMutation = useMutation({
    mutationFn: async (payload: BulkMessagePayload) => {
      const res = await axiosInstance.post("/bulk-messaging/send", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Message sent successfully");
      queryClient.invalidateQueries({ queryKey: MESSAGE_LOGS_QUERY_KEY });
    },
    onError: (err: any) => {
      toast.error(toastMessage(parseApiError(err)));
    },
  });

  return {
    merchantOptions,
    customerOptions,
    sendMessage: sendMutation.mutateAsync,
    sendLoading: sendMutation.isPending,
    searchLogs,
    setSearchLogs,
  };
}

export function useMessageLogs() {
  const [searchLogs, setSearchLogs] = useState("");
  const [debouncedSearch] = useDebounce(searchLogs, 400);

  const { data, isLoading } = useQuery({
    queryKey: [MESSAGE_LOGS_QUERY_KEY, debouncedSearch],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get(
          `/bulk-messaging/logs?search=${encodeURIComponent(debouncedSearch)}`
        );
        const raw = res.data?.data ?? res.data;
        const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
        return list as MessageLog[];
      } catch {
        return [];
      }
    },
    retry: false,
  });

  const logs = (data ?? []) as MessageLog[];
  const filteredLogs = debouncedSearch
    ? logs.filter(
        (log) =>
          log.messageSnippet?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          String(log.recipientType).toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          log.sentAt?.includes(debouncedSearch)
      )
    : logs;

  return {
    logs: filteredLogs,
    loading: isLoading,
    searchLogs,
    setSearchLogs,
  };
}

export function useMessageDetail(id: string | null) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["bulk-messaging-log-detail", id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/bulk-messaging/logs/${id}`);
      const raw = res.data?.data ?? res.data;
      return (raw?.data ?? raw) as MessageDetail;
    },
    enabled: !!id,
  });

  const retryMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post(`/bulk-messaging/logs/${id}/retry`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Retry initiated");
      queryClient.invalidateQueries({ queryKey: ["bulk-messaging-log-detail", id] });
      queryClient.invalidateQueries({ queryKey: MESSAGE_LOGS_QUERY_KEY });
    },
    onError: (err: any) => {
      toast.error(toastMessage(parseApiError(err)));
    },
  });

  return {
    detail: data ?? null,
    loading: isLoading,
    retry: retryMutation.mutate,
    retryLoading: retryMutation.isPending,
  };
}
