/** The merchant record as the API returns it, shared by every feature that
 * displays one. It lived in `features/transactions` only because that is
 * where it was first needed. */
export interface IAssociatedMerchant {
  id: string;
  contactEmail: string;
  businessName: string;
  shortBusinessName: string;
  status: string;
  businessLogo: string;
  businessAddress: string;
  paygoCommission: number;
  businessWebsite: string;
  businessDescription: string;
  bankName: string;
  bankCode: string;
  bankAccountNumber: string;
  bankAccountName: string;
  paystackRecipientCode: string;
  cacDocument: string;
  merchantType: string;
  testApiKey: string | null;
  liveApiKey: string | null;
  vendingDisabled: boolean;
  divertFundToPaygo: boolean;
  amrCustomerId: string | null;
  loraCustomerId: string | null;
  createdAt: string;
  updatedAt: string;
  country: string;
  currency: string;
}

/** GET /v1/merchants and /v1/merchant — the v2 contract (D-052). */
export interface Merchant {
  id: string;
  name: string;
  country: string;
  currency: string;
  shortBusinessName: string;
  address: string;
  website?: string | null;
  createdAt: string;
}
