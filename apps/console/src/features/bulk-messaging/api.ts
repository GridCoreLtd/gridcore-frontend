import axiosInstance from "@/utils/axios-instance";

/** Bulk messaging on the v2 contract (blueprint 50). SMS or email — never WhatsApp (C6). */
export type DeliveryChannel = "SMS" | "EMAIL";

export interface BulkAudience {
  allCustomers?: boolean;
  allMerchants?: boolean;
  customerIds?: string[];
  merchantIds?: string[];
}

export interface BulkMessageSummary {
  id: string;
  channel: DeliveryChannel;
  title: string;
  state: "PENDING" | "PROCESSING" | "COMPLETED" | "PARTIAL_SUCCESS" | "FAILED";
  sentAt: string;
  sentBy: string;
  recipientCount: number;
  failedCount: number;
}

export interface BulkMessageDetail extends BulkMessageSummary {
  body: string;
  sentCount: number;
}

export interface BulkRecipient {
  id: string;
  recipientType: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  deliveryState: string;
  sentAt?: string | null;
}

export const previewBulkAudience = async (audience: BulkAudience) =>
  (await axiosInstance.post<{ recipientCount: number }>("/v1/bulk-messages/preview", audience))
    .data;

export const sendBulkMessage = async (body: {
  channel: DeliveryChannel;
  title: string;
  body: string;
  audience: BulkAudience;
}) =>
  (
    await axiosInstance.post<{ id: string; recipientCount: number; alreadySent: boolean }>(
      "/v1/bulk-messages",
      body,
    )
  ).data;

export const listBulkMessages = async () =>
  (await axiosInstance.get<{ data: BulkMessageSummary[] }>("/v1/bulk-messages")).data;

export const getBulkMessage = async (id: string) =>
  (await axiosInstance.get<BulkMessageDetail>(`/v1/bulk-messages/${id}`)).data;

export const listBulkRecipients = async (id: string, after?: string) =>
  (
    await axiosInstance.get<{ data: BulkRecipient[] }>(`/v1/bulk-messages/${id}/recipients`, {
      params: { after: after || undefined, pageSize: 50 },
    })
  ).data;

export const retryBulkMessage = async (id: string) =>
  axiosInstance.post<void>(`/v1/bulk-messages/${id}/retry`);
