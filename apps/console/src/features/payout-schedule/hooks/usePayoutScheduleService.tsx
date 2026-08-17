
import { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef} from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { SquarePen, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { applyFieldErrors, parseApiError, toastMessage } from "@gridcore/api-client";
import axiosInstance from "@/utils/axios-instance";


import type {
  PayoutSchedule,
  CreatePayoutSchedulePayload,
  UpdatePayoutSchedulePayload,
} from "../types";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function usePayoutScheduleService() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<PayoutSchedule | null>(null);

  const form = useForm<CreatePayoutSchedulePayload>({
    defaultValues: {
      label: "",
      frequency: "DAILY",
      timeOfDay: "17:00",
      cutoffHours: 0,
    },
  });

  const schedulesQuery = useQuery({
    queryKey: ["payout-schedules"],
    queryFn: async () => {
      const res = await axiosInstance.get("/payments/payout-schedules");
      const payload = res.data?.data ?? res.data ?? res;
      return (Array.isArray(payload) ? payload : payload?.data ?? []) as PayoutSchedule[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreatePayoutSchedulePayload) => {
      const res = await axiosInstance.post("/payments/payout-schedules", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Payout schedule created");
      queryClient.invalidateQueries({ queryKey: ["payout-schedules"] });
      closeModal();
    },
    onError: (err: any) => {
      const problem = parseApiError(err);
      // Field errors render under their input; only a failure that maps to
      // nothing gets a toast. See architecture/10-api-errors.md.
      if (
        applyFieldErrors(problem, form.setError, Object.keys(form.getValues() ?? {}))
      ) {
        toast.error(toastMessage(problem));
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePayoutSchedulePayload }) => {
      const res = await axiosInstance.patch(`/payments/payout-schedules/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Payout schedule updated");
      queryClient.invalidateQueries({ queryKey: ["payout-schedules"] });
      closeModal();
    },
    onError: (err: any) => {
      const problem = parseApiError(err);
      // Field errors render under their input; only a failure that maps to
      // nothing gets a toast. See architecture/10-api-errors.md.
      if (
        applyFieldErrors(problem, form.setError, Object.keys(form.getValues() ?? {}))
      ) {
        toast.error(toastMessage(problem));
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosInstance.delete(`/payments/payout-schedules/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Payout schedule deleted");
      queryClient.invalidateQueries({ queryKey: ["payout-schedules"] });
    },
    onError: (err: any) => {
      // Deleting isn't a form submission — there is no field to blame.
      toast.error(toastMessage(parseApiError(err)));
    },
  });

  function openCreate() {
    setEditingSchedule(null);
    form.reset({
      label: "",
      frequency: "DAILY",
      timeOfDay: "17:00",
      cutoffHours: 0,
      dayOfWeek: undefined,
      dayOfMonth: undefined,
    });
    setModalOpen(true);
  }

  function openEdit(schedule: PayoutSchedule) {
    setEditingSchedule(schedule);
    form.reset({
      label: schedule.label,
      frequency: schedule.frequency,
      timeOfDay: schedule.timeOfDay,
      cutoffHours: schedule.cutoffHours,
      dayOfWeek: schedule.dayOfWeek ?? undefined,
      dayOfMonth: schedule.dayOfMonth ?? undefined,
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingSchedule(null);
    form.reset();
  }

  function onSubmit(data: CreatePayoutSchedulePayload) {
    const payload: CreatePayoutSchedulePayload = {
      label: data.label,
      frequency: data.frequency,
      timeOfDay: data.timeOfDay,
      cutoffHours: Number(data.cutoffHours),
    };
    if (data.frequency === "WEEKLY") payload.dayOfWeek = data.dayOfWeek;
    if (data.frequency === "MONTHLY") payload.dayOfMonth = data.dayOfMonth;

    if (editingSchedule) {
      updateMutation.mutate({ id: editingSchedule.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  function toggleActive(schedule: PayoutSchedule) {
    updateMutation.mutate({
      id: schedule.id,
      data: { isActive: !schedule.isActive },
    });
  }

  const columnHelper = createColumnHelper<PayoutSchedule>();

  const columns: ColumnDef<PayoutSchedule, any>[] = [
    columnHelper.accessor("label", {
      header: "LABEL",
      cell: (info) => (
        <span className="text-gray-900 font-medium">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("frequency", {
      header: "FREQUENCY",
      cell: (info) => (
        <span className="capitalize text-sm">{info.getValue().toLowerCase()}</span>
      ),
    }),
    columnHelper.accessor("timeOfDay", {
      header: "TIME",
      cell: (info) => <span className="text-gray-700">{info.getValue()}</span>,
    }),
    columnHelper.display({
      id: "schedule_detail",
      header: "DAY",
      cell: (info) => {
        const row = info.row.original;
        if (row.frequency === "WEEKLY" && row.dayOfWeek != null) {
          return <span>{DAY_NAMES[parseInt(row.dayOfWeek)]}</span>;
        }
        if (row.frequency === "MONTHLY" && row.dayOfMonth != null) {
          return <span>Day {row.dayOfMonth}</span>;
        }
        return <span className="text-gray-400">—</span>;
      },
    }),
    columnHelper.accessor("cutoffHours", {
      header: "CUTOFF (HRS)",
      cell: (info) => <span>{info.getValue()}h</span>,
    }),
    columnHelper.accessor("_count.payoutPreferences" as any, {
      id: "merchantCount",
      header: "MERCHANTS",
      cell: (info) => (
        <span className="text-gray-700">{info.row.original._count?.payoutPreferences ?? 0}</span>
      ),
    }),
    columnHelper.accessor("isActive", {
      header: "STATUS",
      cell: (info) => {
        const active = info.getValue();
        return (
          <button
            type="button"
            onClick={() => toggleActive(info.row.original)}
            disabled={updateMutation.isLoading}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              active
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-white" : "bg-gray-400"}`} />
            {active ? "Active" : "Inactive"}
          </button>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      header: "CREATED",
      cell: (info) => (
        <span className="text-gray-500 whitespace-nowrap text-xs">
          {format(new Date(info.getValue()), "yyyy-MM-dd")}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "ACTIONS",
      cell: (info) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openEdit(info.row.original)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
            title="Edit"
          >
            <SquarePen className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(`Delete "${info.row.original.label}"? This cannot be undone.`)) {
                deleteMutation.mutate(info.row.original.id);
              }
            }}
            disabled={deleteMutation.isLoading}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    }),
  ];

  return {
    schedules: schedulesQuery.data ?? [],
    loading: schedulesQuery.isFetching,
    columns,
    modalOpen,
    editingSchedule,
    form,
    isSubmitting: createMutation.isLoading || updateMutation.isLoading,
    openCreate,
    closeModal,
    onSubmit,
  };
}
