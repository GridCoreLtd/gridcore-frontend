
import React, { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import Button from "@gridcore/ui/components/Button";
import Modal from "@gridcore/ui/components/overlays/Modal";
import NotificationModal from "@gridcore/ui/components/overlays/NotificationModal";
import { parseApiError, toastMessage } from "@gridcore/api-client";
import axiosInstance from "@/utils/axios-instance";

const NewApplicationActions = ({ merchantId }: any) => {
  const [openModal, setOpenModal] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const queryClient = useQueryClient();

  const merchantMutation = useMutation({
    mutationFn: async (reqData: { status: string }) => {
      return axiosInstance.patch(
        `/auth/change-merchant-status/${merchantId}`,
        reqData
      );
    },
    onError: (error: any) => {
      toast.error(toastMessage(parseApiError(error)));
    },
    onSuccess(data) {
      const successMessage =
        actionType === "approve"
          ? "Merchant approved successfully"
          : "Merchant rejected successfully";

      setOpenModal(false);
      setNotificationMessage(successMessage);
      setShowNotifModal(true);
    },
  });

  const handleAction = (type: "approve" | "reject") => {
    setActionType(type);
    setOpenModal(true);
  };

  const confirmAction = () => {
    if (actionType === "approve") {
      merchantMutation.mutate({ status: "approved" });
    } else if (actionType === "reject") {
      merchantMutation.mutate({ status: "rejected" });
    }
    setOpenModal(false);
  };

  return (
    <section>
      <div className="flex gap-4 flex-wrap sm:flex-nowrap">
        <Button
          text="Reject"
          height="33px"
          width="100px"
          variant="destructive"
          onClick={() => handleAction("reject")}
          isLoading={merchantMutation.isLoading && actionType === "reject"}
          isDisabled={merchantMutation.isLoading && actionType === "approve"}
        />

        <Button
          text="Approve"
          height="33px"
          width="100px"
          variant="success"
          onClick={() => handleAction("approve")}
          isLoading={merchantMutation.isLoading && actionType === "approve"}
          isDisabled={merchantMutation.isLoading && actionType === "reject"}
        />
      </div>

      <Modal open={openModal} setOpen={setOpenModal}>
        <div className="text-lg text-center mt-4">
          {actionType === "approve"
            ? "Are you sure you want to approve this merchant?"
            : "Are you sure you want to reject this merchant?"}
        </div>

        <div className="flex gap-4 flex-wrap sm:flex-nowrap justify-center mt-8">
          <Button
            text="No"
            height="33px"
            width="100px"
            variant="outline"
            className="ring-1 ring-accent ring-inset"
            onClick={() => setOpenModal(false)}
          />

          <Button
            text="Yes"
            height="33px"
            width="100px"
            onClick={confirmAction}
            isLoading={merchantMutation.isLoading}
          />
        </div>
      </Modal>

      <NotificationModal
        open={showNotifModal}
        setOpen={setShowNotifModal}
        actionButtonText="Return to Merchant List"
        onCloseAction={() => {
          setShowNotifModal(false);
          window.location.href = "/merchants";
        }}
        title="Success"
        type="success"
      >
        {notificationMessage}
      </NotificationModal>
    </section>
  );
};

export default NewApplicationActions;
