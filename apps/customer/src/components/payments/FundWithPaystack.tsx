import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { object, ObjectSchema, number } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@gridcore/ui/components/Button";
import Textfield from "../shared/Textfield";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/utils/axios-instance";
import { toast } from "react-toastify";
import { userAtom } from "@gridcore/api-client";
import { useAtom } from "jotai";
import { usePaystackPayment } from "react-paystack";
import { useUserProfile } from "@/hooks/useUserProfile";
import { calculatePaystackFee } from "@/utils/payment-utils";
import Modal from "@gridcore/ui/components/overlays/Modal";
import NotificationModal from "@gridcore/ui/components/overlays/NotificationModal";
import Loader from "@gridcore/ui/components/overlays/Loader";
import { applyFieldErrors, parseApiError, toastMessage } from "@gridcore/api-client";

const FundWithPaystack = () => {
  const [openModal, setOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const [user]: any = useAtom(userAtom);
  const { refetchProfile } = useUserProfile();

  interface FundWalletForm {
    amount: number;
  }

  const validationSchema: ObjectSchema<FundWalletForm> = object({
    amount: number()
      .typeError("Amount is required and should be a numeric input")
      .min(100, "The minimum topup amount is ₦100")
      .required("Amount is required")
      .positive(),
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
    getValues,
  } = useForm<FundWalletForm>({
    resolver: yupResolver(validationSchema),
    mode: "onBlur",
  });

  const amount = watch("amount");

  const fundWalletMutation = useMutation({
    mutationFn: async (reqData) => {
      return axiosInstance.post("/wallets/fund-with-paystack", reqData);
    },
    onError: (error: any) => {
      const problem = parseApiError(error);
      // Field errors render under their input; only a failure that maps to
      // nothing gets a toast. See architecture/10-api-errors.md.
      if (applyFieldErrors(problem, setError, Object.keys(getValues() ?? {}))) {
        toast.error(toastMessage(problem));
      }
    },
    onSettled: async (data: any) => {
      await refetchProfile();
      setIsLoading(false);
      setNotificationMessage(
        data?.data?.message || "Wallet funded successfully"
      );
      setShowNotifModal(true);
    },
  });

  const paymentProcessingFee = calculatePaystackFee(amount);
  const grossAmount =
    parseFloat(amount as unknown as string) + paymentProcessingFee;

  const onSuccess = (response: any) => {
    const reqData = {
      paymentReference: response.reference,
      amount: parseFloat(amount as unknown as string),
      paymentProcessingFee,
    };
    fundWalletMutation.mutate(reqData as any);
    setIsLoading(true);
  };

  const onClose = () => {
    console.log("closed");
  };

  const initializePayment = usePaystackPayment({
    reference: new Date().getTime().toString(),
    email: user?.email,
    amount: grossAmount * 100,
    publicKey: import.meta.env.VITE_PAYSTACK_KEY as string,
  });

  const onSubmit = () => {
    setOpenModal(false);
    initializePayment(onSuccess as any, onClose);
  };

  const handleTriggerClick = () => {
    setOpenModal(true);
    // if (closePopover) closePopover();
  };

  return (
    <>
      <button
        onClick={handleTriggerClick}
        className="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-hidden focus-visible:ring-3 focus-visible:ring-orange-500/50 text-left w-full"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20.7708 0.480835H1.21609C0.559401 0.480835 0 1.04024 0 1.72125V3.93453C0 4.61554 0.559401 5.17494 1.21609 5.17494H20.7708C21.4518 5.17494 21.9869 4.61554 22.0112 3.93453V1.74557C22.0112 1.04024 21.4518 0.480835 20.7708 0.480835ZM20.7708 12.7633H1.21609C0.899907 12.7633 0.583723 12.885 0.364827 13.1282C0.121609 13.3714 0 13.6632 0 14.0038V16.217C0 16.898 0.559401 17.4575 1.21609 17.4575H20.7708C21.4518 17.4575 21.9869 16.9224 22.0112 16.217V14.0038C21.9869 13.2984 21.4518 12.7633 20.7708 12.7633ZM12.2339 18.8924H1.21609C0.899907 18.8924 0.583723 19.014 0.364827 19.2573C0.145931 19.5005 0 19.7923 0 20.1328V22.3461C0 23.0271 0.559401 23.5865 1.21609 23.5865H12.2095C12.8906 23.5865 13.4256 23.0271 13.4256 22.3705V20.1572C13.45 19.4275 12.9149 18.8681 12.2339 18.8924ZM22.0112 6.60993H1.21609C0.899907 6.60993 0.583723 6.73154 0.364827 6.97475C0.145931 7.21797 0 7.50984 0 7.85034V10.0636C0 10.7446 0.559401 11.304 1.21609 11.304H21.9869C22.6679 11.304 23.203 10.7446 23.203 10.0636V7.85034C23.2273 7.16933 22.6679 6.63425 22.0112 6.60993Z"
              fill="#00C3F7"
            />
          </svg>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-900">Paystack</p>
          <p className="text-sm text-gray-500">
            Fund with your card, bank transfer, or USSD
          </p>
        </div>
      </button>

      {openModal && (
        <Modal open={true} setOpen={setOpenModal}>
          <section>
            <h2 className="text-2xl font-medium mb-2">Fund Wallet</h2>
            <div className="text-accent text-sm mb-6">
              Please indicate the desired amount you wish to fund
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Textfield
                type="number"
                id="amount"
                label="Enter amount"
                placeholder="Enter amount"
                register={register}
                error={errors.amount?.message}
              />

              <div className="mt-8">
                <Button type="submit" text="Submit" width="200px" />
              </div>
            </form>
          </section>
        </Modal>
      )}

      <NotificationModal
        open={showNotifModal}
        setOpen={setShowNotifModal}
        title="Success"
        type="success"
      >
        {notificationMessage}
      </NotificationModal>

      {isLoading && (
        <Loader
          setOpen={setIsLoading}
          message="Please wait while we process your transaction"
        />
      )}
    </>
  );
};

export default FundWithPaystack;
