import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import Button from "@gridcore/ui/components/Button";
import Modal from "@gridcore/ui/components/overlays/Modal";
import { parseApiError, toastMessage } from "@gridcore/api-client";
import axiosInstance from "@/utils/axios-instance";

interface RetryPayoutButtonProps {
  payoutId: string;
  status: string;
  currentPage?: number;
}

const RetryPayoutButton = ({
  payoutId,
  status,
  currentPage,
}: RetryPayoutButtonProps) => {
  const [openModal, setOpenModal] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: retryPayout, isPending } = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post(`/payments/retry-payout/`, {
        payoutId,
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(
        data?.data?.message || "Payout retry initiated successfully",
      );
      setOpenModal(false);
      queryClient.invalidateQueries({ queryKey: ["payouts", currentPage] });
    },
    onError: (error: any) => {
      toast.error(toastMessage(parseApiError(error)));
    },
  });

  const handleConfirmRetry = () => {
    retryPayout();
  };

  if (status !== "failed") {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setOpenModal(true)}
        className="text-primary hover:text-primary-dark text-sm font-medium underline"
      >
        Retry
      </button>

      <Modal
        open={openModal}
        setOpen={setOpenModal}
        title="Confirm Payout Retry"
      >
        <div className="mt-4">
          <p className="text-gray-600 mb-6">
            Are you sure you want to retry this payout? This action cannot be
            undone.
          </p>

          <div className="flex gap-3 justify-end">
            <Button
              text="Cancel"
              onClick={() => setOpenModal(false)}
              variant="neutral"
              isDisabled={isPending}
            />
            <Button
              text={isPending ? "Retrying..." : "Confirm Retry"}
              onClick={handleConfirmRetry}
              isLoading={isPending}
              isDisabled={isPending}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default RetryPayoutButton;
