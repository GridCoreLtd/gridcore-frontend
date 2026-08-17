import type { ColumnDef } from "@tanstack/react-table";

import type { IAssociatedMerchant } from "@/entities/merchant";


export interface ISite {
  id: string;
  name: string;
  location: string;
  merchantId: string;
  tariffIndex: number;
  tariff: number;
  owedAmount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IUser {
  firstName: string;
  lastName: string;
  associatedMerchant: IAssociatedMerchant;
  site: ISite | null;
}

export interface IMerchant {
  businessName: string;
}

export interface ITransaction {
  id: string;
  amount: number;
  grossAmount: number | null;
  userId: string;
  merchantId: string | null;
  currency: string;
  vat: number;
  paymentProcessingFee: number;
  description: string | null;
  status: string;
  gatewayResponse: string | null;
  type: string;
  source: string;
  destination: string | null;
  meterNumber: string | null;
  reference: string;
  paymentGateway: string | null;
  noOfUnits: number;
  createdAt: string;
  updatedAt: string;
  user: IUser;
  merchant: IMerchant | null;
}

export interface ITransactionServiceResult {
  transactions: ITransaction[];
  loading: boolean;
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  filter: {
    activeFilters: Record<string, any>;
    onApply: (filters: Record<string, any>) => void;
    merchantOptions: { value: string; label: string }[];
  };
  search: {
    register: any; // From react-hook-form
    id: string;
    placeholder: string;
  };
  dateRange: {
    startDate: Date | undefined;
    endDate: Date | undefined;
    onDateChange: (
      date: import("react-day-picker").DateRange | undefined,
    ) => void;
    onClear: () => void;
  };
  exportData: {
    isLoading: boolean;
    onExport: () => void;
  };
  detail: {
    open: boolean;
    setOpen: (open: boolean) => void;
    selectedTransaction: ITransaction | null;
    onViewDetail: (id: string) => void;
  };
  columns: ColumnDef<ITransaction>[]; // Updated type
}
