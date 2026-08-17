
import { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef} from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

import { useScopes } from "@/auth/useScopes";
import { applyFieldErrors, parseApiError, toastMessage } from "@gridcore/api-client";
import axiosInstance from "@/utils/axios-instance";
import { formatCurrency } from "@gridcore/ui/lib/format";
import { dateFormatter } from "@/utils/formatters";


import type { IMeter, IMeterServiceResult } from "../types";

export const useMeterService = (): IMeterServiceResult => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [meters, setMeters] = useState<IMeter[]>([]);
  const [editMeter, setEditMeter] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState<IMeter | null>(null);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [topUpMeter, setTopUpMeter] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  const { register, watch,
    setError,
    getValues,
  } = useForm();
  const searchQuery = watch("meterSearch");
  const [debouncedSearchQuery] = useDebounce(searchQuery || "", 500);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { isPlatform } = useScopes();

  // Only platform operators can filter across merchants; a merchant's rows are
  // already scoped to them by the token, so skip the lookup entirely.
  const { data: merchantsData } = useQuery({
    queryKey: ["merchants-list"],
    enabled: isPlatform,
    queryFn: async () => {
      const res = await axiosInstance.get("/merchants?page=1&perPage=100");
      return res.data.data.data;
    },
  });

  const merchantOptions =
    merchantsData?.map((m: any) => ({
      value: m.id,
      label: m.businessName,
    })) || [];

  // Fetch Meter Types for Filter
  const { data: meterTypesData } = useQuery({
    queryKey: ["meterTypes"],
    queryFn: async () => {
      const res = await axiosInstance.get("/meters/types");
      return res.data.data.data;
    },
  });

  const meterTypeOptions =
    meterTypesData?.map((t: string) => ({
      value: t,
      label: t,
    })) || [];

  // Fetch Meter Brands for Filter
  const { data: meterBrandsData } = useQuery({
    queryKey: ["meterBrands"],
    queryFn: async () => {
      const res = await axiosInstance.get("/meters/brands");
      return res.data.data.data;
    },
  });

  const meterBrandOptions =
    meterBrandsData?.map((b: string) => ({
      value: b,
      label: `${b} METER`,
    })) || [];

  // Fetch Meters
  const metersQuery = useQuery({
    queryKey: [
      "meters",
      pagination.pageIndex,
      pagination.pageSize,
      debouncedSearchQuery,
      activeFilters,
    ],
    queryFn: async () => {
      const filterParams = new URLSearchParams();
      if (activeFilters.merchantId)
        filterParams.append("merchantId", activeFilters.merchantId);
      if (activeFilters.meterType)
        filterParams.append("meterType", activeFilters.meterType);
      if (activeFilters.meterBrand)
        filterParams.append("brand", activeFilters.meterBrand);

      const queryString = filterParams.toString();
      const prefix = queryString ? `&${queryString}` : "";

      const res = await axiosInstance.get(
        `/meters?page=${
          pagination.pageIndex + 1
        }&perPage=${pagination.pageSize}&search=${debouncedSearchQuery}${prefix}`,
      );
      return res.data.data;
    },
    onSuccess(data) {
      setMeters(data.data);
      setTotalPages(data.meta.lastPage);
    },
    keepPreviousData: true,
  });

  // Delete Meter Mutation
  const meterDeleteMutation = useMutation({
    mutationFn: async (meter: IMeter) => {
      return axiosInstance.delete(`/meters/${meter.id}`);
    },
    onError: (error: any) => {
      const problem = parseApiError(error);
      // Field errors render under their input; only a failure that maps to
      // nothing gets a toast. See architecture/10-api-errors.md.
      if (applyFieldErrors(problem, setError, Object.keys(getValues() ?? {}))) {
        toast.error(toastMessage(problem));
      }
    },
    onSuccess() {
      setOpenConfirmationModal(false);
      setNotificationMessage("Meter deleted successfully");
      setShowNotifModal(true);
      metersQuery.refetch();
    },
  });

  // Handlers
  const handlePageSizeChange = (pageSize: number) => {
    console.log(pageSize);
    setPagination({ pageSize, pageIndex: 0 });
  };

  const handleEdit = (meter: IMeter) => {
    setSelectedMeter(meter);
    setEditMeter(true);
  };

  const handleView = (meter: IMeter) => {
    navigate(`/meters/${meter.meterNumber}?meterBrand=${meter.meterBrand}`);
  };

  const handleDelete = (meter: IMeter) => {
    setSelectedMeter(meter);
    setOpenConfirmationModal(true);
  };

  const confirmDelete = () => {
    if (selectedMeter) {
      meterDeleteMutation.mutate(selectedMeter);
    }
  };

  const handleTopUp = () => {
    setTopUpMeter(true);
  };

  // Column Helper
  const columnHelper = createColumnHelper<IMeter>();

  // Actions Component
  const renderActions = (meter: IMeter) => {
    return (
      <div className="flex gap-x-3">
        <button className="text-primary" onClick={() => handleEdit(meter)}>
          Edit
        </button>

        <button className="text-primary" onClick={() => handleView(meter)}>
          View
        </button>

        <button className="text-red-500" onClick={() => handleDelete(meter)}>
          Delete
        </button>
      </div>
    );
  };

  // Columns Definition
  const columns = [
    columnHelper.accessor("meterNumber", {
      header: "Meter number",
      cell: (info) => (
        <span className="text-gray-900 font-medium">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("customer", {
      header: "Customer",
      cell: (info) => {
        if (info.cell.row.original.customer) {
          return (
            <span className="text-gray-900 font-medium">
              {info.cell.row.original.customer?.firstName +
                " " +
                info.cell.row.original.customer?.lastName}
            </span>
          );
        }
        return "NA";
      },
    }),
    columnHelper.accessor("meterAddress", { header: "Meter address" }),
    columnHelper.accessor("meterType", { header: "Meter type" }),
    columnHelper.accessor("meterBrand", { header: "Meter brand" }),
    columnHelper.accessor("tariffIndex", { header: "TI" }),
    columnHelper.accessor("tariff", {
      header: "Tariff",
      cell: (info) =>
        formatCurrency({ country: info.row.original.customer?.associatedMerchant?.country, currency: info.row.original.customer?.associatedMerchant?.currency, amount: info.getValue() }),
    }),
    columnHelper.accessor("customer", {
      id: "site",
      header: "Site",
      cell: (info) => {
        const value = info.getValue();
        return `${value?.site?.name ?? "N/A"}`;
      },
    }),
    columnHelper.accessor(
      (row) => {
        if (row.merchant !== undefined && row.merchant !== null)
          return row.merchant;
        if (row.customer !== undefined && row.customer !== null)
          return row.customer;
        return null;
      },
      {
        id: "merchantOrCustomer",
        header: "Merchant",
        cell: (info) => {
          const value = info.getValue();
          return (
            value?.businessName ??
            value?.associatedMerchant?.businessName ??
            "N/A"
          );
        },
      },
    ),
    columnHelper.accessor("createdAt", {
      header: "Date Added",
      cell: (info) => dateFormatter.format(new Date(info.getValue())),
    }),
    columnHelper.display({
      id: "actions",
      cell: (info) => renderActions(info.row.original),
    }),
  ] as ColumnDef<IMeter, any>[];

  const result: IMeterServiceResult = {
    meters,
    loading: metersQuery.isFetching,
    pagination: {
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      totalPages,
      setPagination,
      onPageSizeChange: handlePageSizeChange,
    },
    filter: {
      activeFilters,
      onApply: setActiveFilters,
      merchantOptions,
      meterTypeOptions,
      meterBrandOptions,
    },
    search: {
      register,
      id: "meterSearch",
      placeholder: "Search by meter number, customer name, merchant, etc.",
    },
    columns,
    actions: {
      edit: {
        open: editMeter,
        setOpen: setEditMeter,
        selectedMeter,
        onEdit: handleEdit,
      },
      topUp: {
        open: topUpMeter,
        setOpen: setTopUpMeter,
        onTopUp: handleTopUp,
      },
      delete: {
        confirmOpen: openConfirmationModal,
        setConfirmOpen: setOpenConfirmationModal,
        selectedMeter,
        onDelete: handleDelete,
        confirmDelete,
        isDeleting: meterDeleteMutation.isPending,
      },
      view: {
        onView: handleView,
      },
      notification: {
        showModal: showNotifModal,
        setShowModal: setShowNotifModal,
        message: notificationMessage,
        setMessage: setNotificationMessage,
      },
    },
  };

  return result;
};
