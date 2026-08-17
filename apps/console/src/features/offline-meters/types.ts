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

export interface IOfflineTransaction {
  id: string;
  reference: string;
  amount: number;
  source: string;
  type: string;
  status: string;
  createdAt: string;
  user: IUser;
  merchant?: {
    businessName: string;
  };
}

export interface IOfflineMeterServiceResult {
  transactions: IOfflineTransaction[];
  loading: boolean;
  totalCount: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  search: {
    register: any;
    placeholder: string;
  };
  filter: {
    control: any;
    activeFilters: Record<string, any>;
    onApply: (filters: Record<string, any>) => void;
    merchantOptions: { value: string; label: string }[];
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
    selectedTransaction: IOfflineTransaction | null;
    onViewDetail: (id: string) => void;
  };
  columns: ColumnDef<IOfflineTransaction, any>[];
}
