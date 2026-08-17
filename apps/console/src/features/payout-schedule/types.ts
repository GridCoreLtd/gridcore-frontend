export type PayoutFrequency = "DAILY" | "WEEKLY" | "MONTHLY";

export interface PayoutSchedule {
  id: string;
  label: string;
  frequency: PayoutFrequency;
  timeOfDay: string;
  dayOfWeek?: string | null;
  dayOfMonth?: string | null;
  cutoffHours: number;
  cronExpression: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { payoutPreferences: number };
}

export interface CreatePayoutSchedulePayload {
  label: string;
  frequency: PayoutFrequency;
  timeOfDay: string;
  dayOfWeek?: string;
  dayOfMonth?: string;
  cutoffHours: number;
}

export type UpdatePayoutSchedulePayload = Partial<CreatePayoutSchedulePayload> & {
  isActive?: boolean;
};
