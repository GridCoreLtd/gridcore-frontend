
import { Plus } from "lucide-react";

import Button from "@gridcore/ui/components/Button";
import Modal from "@gridcore/ui/components/overlays/Modal";
import SectionLoader from "@/components/shared/SectionLoader";
import TanStackTable from "@/components/shared/TanStackTable";

import { usePayoutScheduleService } from "./hooks/usePayoutScheduleService";
import type { PayoutFrequency } from "./types";


const DAY_OPTIONS = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

export function PayoutSchedule() {
  const {
    schedules,
    loading,
    columns,
    modalOpen,
    editingSchedule,
    form,
    isSubmitting,
    openCreate,
    closeModal,
    onSubmit,
  } = usePayoutScheduleService();

  const { register, watch, handleSubmit, formState: { errors } } = form;
  const frequency = watch("frequency") as PayoutFrequency;

  return (
    <main className="container max-w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-medium text-gray-900">Payout Schedules</h1>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Schedule
        </button>
      </div>

      <div className="w-full bg-white rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-gray-100">
        {loading && <SectionLoader height={200} />}
        {!loading && (
          <div className="px-4 sm:px-6 pb-4 pt-4">
            <TanStackTable
              columns={columns}
              data={schedules}
              loading={loading}
              pageCount={1}
              pagination={{ pageIndex: 0, pageSize: schedules.length || 10 }}
              setPagination={() => {}}
            />
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        setOpen={closeModal}
        title={editingSchedule ? "Edit Payout Schedule" : "New Payout Schedule"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label
            </label>
            <input
              {...register("label", { required: "Label is required" })}
              type="text"
              placeholder="e.g. Daily at 5PM"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
            />
            {errors.label && (
              <p className="mt-1 text-xs text-red-600">{errors.label.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequency
            </label>
            <select
              {...register("frequency", { required: true })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time of Day (24-hour)
            </label>
            <input
              {...register("timeOfDay", {
                required: "Time is required",
                pattern: {
                  value: /^([01]\d|2[0-3]):[0-5]\d$/,
                  message: 'Must be HH:MM format, e.g. "17:00"',
                },
              })}
              type="text"
              placeholder="17:00"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
            />
            {errors.timeOfDay && (
              <p className="mt-1 text-xs text-red-600">{errors.timeOfDay.message}</p>
            )}
          </div>

          {frequency === "WEEKLY" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Day of Week
              </label>
              <select
                {...register("dayOfWeek", { required: "Day of week is required" })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
              >
                <option value="">Select day</option>
                {DAY_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
              {errors.dayOfWeek && (
                <p className="mt-1 text-xs text-red-600">{errors.dayOfWeek.message}</p>
              )}
            </div>
          )}

          {frequency === "MONTHLY" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Day of Month (1–28)
              </label>
              <input
                {...register("dayOfMonth", {
                  required: "Day of month is required",
                  pattern: {
                    value: /^([1-9]|1\d|2[0-8])$/,
                    message: "Must be a number between 1 and 28",
                  },
                })}
                type="number"
                min={1}
                max={28}
                placeholder="1"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
              />
              {errors.dayOfMonth && (
                <p className="mt-1 text-xs text-red-600">{errors.dayOfMonth.message}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cutoff Hours Before Payout
            </label>
            <input
              {...register("cutoffHours", {
                required: "Cutoff hours is required",
                min: { value: 0, message: "Min is 0" },
                max: { value: 24, message: "Max is 24" },
              })}
              type="number"
              min={0}
              max={24}
              placeholder="0"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
            />
            {errors.cutoffHours && (
              <p className="mt-1 text-xs text-red-600">{errors.cutoffHours.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : editingSchedule ? "Save Changes" : "Create Schedule"}
            </button>
          </div>
        </form>
      </Modal>
    </main>
  );
}
