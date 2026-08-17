/** A payout record, shared by the payouts feature and the CSV export hook. */
export interface Payout {
  id: string;
  reference: string;
  merchantName?: string;
  merchant?: { businessName: string };
  bankName: string;
  bankAccountNumber: string;
  bankAccountName?: string;
  amount: number;
  status: "SUCCESS" | "FAILED" | "PENDING";
  createdAt: string;
  updatedAt?: string;
}
