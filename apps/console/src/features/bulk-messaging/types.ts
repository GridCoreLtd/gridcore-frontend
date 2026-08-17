export type DeliveryChannel = "SMS" | "EMAIL";
export type MessageStatus =
  | "COMPLETED"
  | "FAILED"
  | "PARTIAL_SUCCESS"
  | "PENDING";

export const STATUS_COLORS: Record<MessageStatus, string> = {
  COMPLETED: "bg-green-600",
  FAILED: "bg-red-600",
  PARTIAL_SUCCESS: "bg-amber-500",
  PENDING: "bg-gray-500",
};
export type RecipientType = "MERCHANT" | "CUSTOMER";

export interface BulkMessagePayload {
  merchantIds?: string[];
  customerIds?: string[];
  title: string;
  content: string;
  channel: DeliveryChannel;
  sendToAllMerchants?: boolean;
  sendToAllCustomers?: boolean;
}

export interface MessageLog {
  id: string;
  sentAt: string;
  sentBy: string;
  channel: DeliveryChannel;
  recipientType: RecipientType | "MERCHANT,CUSTOMER";
  messageSnippet: string;
  status: MessageStatus;
  failedCount?: number;
}

export interface MessageRecipient {
  name: string;
  email: string;
  phone: string;
  status: MessageStatus;
}

export interface MessageDetail extends MessageLog {
  title: string;
  content: string;
  recipients: MessageRecipient[];
}

export interface SelectOption {
  value: string;
  label: string;
}
