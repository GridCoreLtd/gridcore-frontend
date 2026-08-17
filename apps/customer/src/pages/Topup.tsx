
import { applyFieldErrors, parseApiError } from "@gridcore/api-client";
import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { object, ObjectSchema, number } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { usePaystackPayment } from "react-paystack";
import { useMutation } from "@tanstack/react-query";
import Button from "@gridcore/ui/components/Button";
import Textfield from "@/components/shared/Textfield";
import MeterOptions from "@/components/topup/MeterOptions";
import PaymentMethod from "@/components/topup/PaymentMethod";
import axiosInstance from "@/utils/axios-instance";
import Loader from "@gridcore/ui/components/overlays/Loader";
import { formatCurrency } from "@gridcore/ui/lib/format";
import { Link } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import Modal from "@gridcore/ui/components/overlays/Modal";
import TopupSuccess from "@/components/topup/TopupSuccess";
import { useNavigate } from "react-router-dom";
import { calculatePaystackFee } from "@/utils/payment-utils";
import NotificationModal from "@gridcore/ui/components/overlays/NotificationModal";
import { toast } from "react-toastify";

const minimumTopup = {
  NG: 100,
  ZA: 2,
};

export default function Topup() {
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("paystack");
  const [selectedMeter, setSelectedMeter]: any = useState(null);
  const { userProfile, refetchProfile } = useUserProfile();
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [token, setToken] = useState("");
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showPendingTranxModal, setShowPendingTranxModal] = useState(false);
  const [pendingTranxMessage, setPendingTranxMessage] = useState("");
  const [isMeterManuallySelected, setIsMeterManuallySelected] = useState(false);

  useEffect(() => {
    if (userProfile && !isMeterManuallySelected) {
      setSelectedMeter(userProfile.meters[0]);
    }
  }, [userProfile, isMeterManuallySelected]);

  interface TopupForm {
    amount: number;
  }

  const validationSchema: ObjectSchema<TopupForm> = object({
    amount: number()
      .typeError("Amount is required and should be a numeric input")
      .min(100, "The minimum topup amount is ₦100")
      .required("Amount is required")
      .positive("The minimum topup amount is ₦100"),
  });

  const {
    register,
    handleSubmit,
    watch,
    setError,
    getValues,
    formState: { errors },
  } = useForm<TopupForm>({
    resolver: yupResolver(validationSchema),
    mode: "onBlur",
  });

  const showError = (message: string) => {
    setNotificationMessage(message);
    setShowNotifModal(true);
  };

  const amount = watch("amount");

  const topupMutation = useMutation({
    mutationFn: (reqData) => {
      const endpoint =
        paymentMethod === "paystack"
          ? "/topups/topup-with-paystack"
          : "/topups/topup-with-wallet";
      return axiosInstance.post(endpoint, reqData, {
        headers: { handleErrorLocally: true },
      });
    },
    onError: (error: unknown) => {
      // `error.response.data.message` threw outright when there was no
      // response. A rejected meter number or amount now shows on that input;
      // anything else keeps using the existing notification modal.
      const problem = parseApiError(error);
      if (applyFieldErrors(problem, setError, Object.keys(getValues() ?? {}))) {
        showError(problem.detail);
      }
    },
    onSuccess: (data) => {
      if (data.data.data.data.status === "success") {
        setToken(data.data.data.data.token);
        setOpenSuccessModal(true);
      } else if (data.data.data.data.status === "pending") {
        setPendingTranxMessage(data.data.message);
        setShowPendingTranxModal(true);
      }
      refetchProfile();
    },
  });

  const paymentProcessingFee = calculatePaystackFee(amount);
  const grossAmount = Math.round(
    parseFloat(amount as unknown as string) + paymentProcessingFee,
  );

  const onSuccess = (response: any) => {
    const reqData = {
      paymentReference: response.reference,
      meterNumber: selectedMeter.meterNumber,
      topupAmount: parseFloat(amount as unknown as string),
      paymentProcessingFee,
    };

    topupMutation.mutate(reqData as any);
  };

  const onClose = () => {
    console.log("closed");
  };

  const initializePayment = usePaystackPayment({
    reference: new Date().getTime().toString(),
    email: userProfile?.email,
    amount: grossAmount * 100,
    publicKey: import.meta.env.VITE_PAYSTACK_KEY as string,
  });

  const onSubmit = (data: TopupForm) => {
    if (userProfile?.banned) {
      toast.error(
        "You are currently banned from making performing this operation. Please contact support!",
      );
      return;
    }

    if (paymentMethod === "paystack") {
      initializePayment(onSuccess as any, onClose);
    } else if (paymentMethod === "wallet") {
      const reqData = {
        meterNumber: selectedMeter.meterNumber,
        topupAmount: parseFloat(data.amount as unknown as string),
      };
      topupMutation.mutate(reqData as any);
    }
  };

  const closeModal = () => {
    navigate("/dashboard");
  };

  const isButtonDisabled = useMemo(() => {
    const countryCode = userProfile?.associatedMerchant?.country
      .code as keyof typeof minimumTopup;
    const minAmount = minimumTopup[countryCode] || 0;
    const isAmountValid = amount >= minAmount;

    if (paymentMethod === "paystack") {
      return !isAmountValid;
    }

    if (paymentMethod === "wallet") {
      return !isAmountValid || (userProfile?.wallet?.balance ?? 0) < amount;
    }

    return true;
  }, [amount, userProfile, paymentMethod]);

  return (
    <main className="max-w-xl my-10 container">
      <h2 className="text-2xl font-medium mb-2">Top Up Meter</h2>
      <div className="text-accent mb-9">
        Fill in the information below to purchase token for your meter
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
        <div>
          <label
            htmlFor="meters"
            className="block text-sm font-medium leading-6 mb-2"
          >
            Click to select meter:
          </label>
          <MeterOptions
            meters={userProfile?.meters}
            selectedMeter={selectedMeter}
            setSelectedMeter={(meter) => {
              setSelectedMeter(meter);
              setIsMeterManuallySelected(true);
            }}
          />
        </div>

        <Textfield
          type="number"
          id="amount"
          label="Enter amount"
          placeholder="Enter amount"
          register={register}
          error={errors.amount?.message}
        />
        <div className="mb-16">
          <label
            htmlFor="payment"
            className="block text-sm font-medium leading-6 mb-2"
          >
            Select payment method:
          </label>

          <PaymentMethod
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            meterType={selectedMeter?.meterType}
            country={userProfile?.associatedMerchant?.country?.code}
          />

          {paymentMethod === "wallet" && (
            <div className="mt-4 text-sm">
              {userProfile?.wallet?.balance == undefined ||
              userProfile?.wallet?.balance == "undefined" ? (
                <>...</>
              ) : (
                <>
                  {amount <= userProfile.wallet.balance ? (
                    <div>
                      Your wallet balance is{" "}
                      <span className="font-medium">
                        {formatCurrency({ currency: userProfile?.associatedMerchant?.currency?.code, amount: userProfile.wallet.balance || 0, country: userProfile?.associatedMerchant?.country?.code })}
                      </span>
                    </div>
                  ) : (
                    <div className="text-red-500">
                      Your wallet balance is not sufficient to complete this
                      transaction.{" "}
                      <Link
                        to="/payments"
                        className="text-primary underline font-medium"
                      >
                        Click here
                      </Link>{" "}
                      to fund your wallet
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        <div>
          <Button
            type="submit"
            text="Make Payment"
            isLoading={topupMutation.isLoading}
            isDisabled={isButtonDisabled}
            width="200px"
          />
        </div>
      </form>

      {topupMutation.isLoading && (
        <Loader
          message="Please wait while we process your transaction"
          setOpen={() => true}
        />
      )}

      {openSuccessModal && (
        <Modal
          open={true}
          setOpen={setOpenSuccessModal}
          onCloseAction={closeModal}
        >
          <TopupSuccess
            token={token}
            meter={selectedMeter}
            closeModal={closeModal}
          />
        </Modal>
      )}

      <NotificationModal
        open={showNotifModal}
        setOpen={setShowNotifModal}
        title="Error"
        type="error"
      >
        {notificationMessage}
      </NotificationModal>

      <NotificationModal
        open={showPendingTranxModal}
        setOpen={setShowPendingTranxModal}
        onCloseAction={closeModal}
        title="Info"
        type="info"
      >
        {pendingTranxMessage}
      </NotificationModal>
    </main>
  );
}
