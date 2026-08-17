import type { ColumnDef } from "@tanstack/react-table";

import type { IAssociatedMerchant } from "@/entities/merchant";

/** GET /v1/meters — the v2 contract (D-052). */
export interface MeterListItem {
  id: string;
  meterNumber: string;
  commodity: string;
  comms: string;
  merchantName: string;
  siteName?: string | null;
  customerName?: string | null;
  lastPolledAt?: string | null;
  createdAt: string;
}

export interface MeterListPage {
  data: MeterListItem[];
  cursor: { next?: string; hasMore: boolean };
}

// ---- legacy shapes below — they go with the unported detail screens ----

export enum MeterTypes {
  GSM = "GSM",
  OTHER = "OTHERS",
  LORA = "LORA",
  CALIN = "CALIN",
}

export interface meterPowerArgs {
  meterId: string;
  status: string;
}

export interface LoadProfileItem {
  currentDate: string;
  instantaneousVoltage: string;
  instantaneousCurrent: string;
  totalActivePower: string;
}

export type IMeterStats = {
  id: string;
  meterId: string;
  voltage: string;
  current: string;
  activePower: string;
  activeEnergy: string;
  residualAmount: string;
  triggeredBy: string;
  fetchedAt: string;
  meterDetails: null | object;
};

export interface ChartPoint {
  time: string; // chart label
  power: number; // y-axis
  voltage: number;
  current: number;
}

export interface IMeter {
  id: string;
  meterNumber: string;
  meterAddress: string;
  meterType: string;
  meterBrand: string;
  tariffIndex: string;
  tariff: number;
  customer: {
    firstName: string;
    lastName: string;
    site?: {
      name: string;
    };
    associatedMerchant?: IAssociatedMerchant;
  };
  merchant?: {
    businessName: string;
  };
  associatedMerchant?: IAssociatedMerchant;
  createdAt: string;
}

export interface IMeterServiceResult {
  meters: IMeter[];
  loading: boolean;
  pagination: {
    pageIndex: number;
    pageSize: number;
    totalPages: number;
    setPagination: (pagination: {
      pageIndex: number;
      pageSize: number;
    }) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  filter: {
    activeFilters: Record<string, any>;
    onApply: (filters: Record<string, any>) => void;
    merchantOptions: { value: string; label: string }[];
    meterTypeOptions: { value: string; label: string }[];
    meterBrandOptions: { value: string; label: string }[];
  };
  search: {
    register: any; // From react-hook-form
    id: string;
    placeholder: string;
  };
  columns: ColumnDef<IMeter>[];
  actions: {
    edit: {
      open: boolean;
      setOpen: (open: boolean) => void;
      selectedMeter: IMeter | null;
      onEdit: (meter: IMeter) => void;
    };
    topUp: {
      open: boolean;
      setOpen: (open: boolean) => void;
      onTopUp: () => void;
    };
    delete: {
      confirmOpen: boolean;
      setConfirmOpen: (open: boolean) => void;
      selectedMeter: IMeter | null;
      onDelete: (meter: IMeter) => void;
      confirmDelete: () => void;
      isDeleting: boolean;
    };
    view: {
      onView: (meter: IMeter) => void;
    };
    notification: {
      showModal: boolean;
      setShowModal: (show: boolean) => void;
      message: string;
      setMessage: (message: string) => void;
    };
  };
}
