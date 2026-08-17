import type { ColumnDef } from "@tanstack/react-table";
import type { DateRange } from "react-day-picker";

import type { IAssociatedMerchant } from "@/entities/merchant";

export interface ISite {
  name: string;
}

export interface IUser {
  firstName: string;
  lastName: string;
  site?: ISite;
  associatedMerchant?: IAssociatedMerchant;
}

export interface ITransaction {
  reference: string;
  amount: number;
  source: string;
  paymentProcessingFee: number;
}

export interface IMeter {
  meterNumber: string;
  meterAddress?: string;
}

export interface IHelperResponse {
  message: string;
}

export interface ITopup {
  id: string;
  meter: IMeter;
  transaction: ITransaction;
  user: IUser;
  token: string;
  noOfUnits: string;
  topupStatus: string;
  createdAt: string;
  tariffUsed?: number;
  description?: string;
  providerResponse?: IHelperResponse;
}

export interface ITopupServiceResult {
  topups: ITopup[];
  loading: boolean;
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  search: {
    register: any; // From react-hook-form
    placeholder: string;
  };
  filter: {
    activeFilters: Record<string, any>;
    onApply: (filters: Record<string, any>) => void;
    merchantOptions: { value: string; label: string }[];
    statusOptions: { value: string; label: string }[];
  };
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
    onDateChange: (range: DateRange | undefined) => void;
    onClear: () => void;
  };
  exportData: {
    isLoading: boolean;
    onExport: () => void;
  };
  detail: {
    open: boolean;
    setOpen: (open: boolean) => void;
    selectedTopup: ITopup | null;
    onViewDetail: (id: string) => void;
  };
  columns: ColumnDef<ITopup, any>[];
}
