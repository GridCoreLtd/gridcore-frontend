/** `GET /v1/my/meters` — the session's own meters, no cursor (a handful, not a fleet). */
export interface MyMeter {
  id: string;
  meterNumber: string;
  commodity: string;
  comms: string;
  address?: string;
  siteName?: string;
  assignedSince: string;
  lastPolledAt?: string;
}
