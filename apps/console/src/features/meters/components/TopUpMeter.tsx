
import React, { useEffect, useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ObjectSchema} from "yup";
import { number, object, string } from "yup";

import Button from "@gridcore/ui/components/Button";
import DurationInput from "@/components/shared/DurationInput";
import Modal from "@gridcore/ui/components/overlays/Modal";
import NotificationModal from "@gridcore/ui/components/overlays/NotificationModal";
import SelectInput from "@/components/shared/SelectInput";
import Textfield from "@/components/shared/Textfield";
import MeterCards from "./MeterCards";
import { TopupSuccess } from "@/entities/topup";
import { applyFieldErrors, parseApiError, toastMessage } from "@gridcore/api-client";
import axiosInstance from "@/utils/axios-instance";

interface TopUpMeterProps {
  closeSlideOver: () => void;
}

interface MeterForm {
  meterNumber: string;
  paymentType: string;
  amount?: number;
  unit?: number;
}

export function TopUpMeter({ closeSlideOver }: TopUpMeterProps) {
  const queryClient = useQueryClient();

  const topupTypes = ["wallet", "offline"];
  const [meter, setMeter] = useState<any>({});
  const [token, setToken] = useState("");
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [pendingTranxMessage, setPendingTranxMessage] = useState("");
  const [showPendingTranxModal, setShowPendingTranxModal] = useState(false);
  const [response, setResponse] = useState<any>({});

  const formattedaymentType = topupTypes?.map((paymentType: any) => ({
    value: paymentType,
    label: `${paymentType?.toUpperCase()}`,
  }));

  const validationSchema: ObjectSchema<MeterForm> = object({
    meterNumber: string().required("Meter number is required"),
    paymentType: string().required("Payment type is required"),
    amount: number().optional(),
    unit: number().optional(),
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    getValues,
    setValue,
    watch,
    setError,
  } = useForm<MeterForm>({
    resolver: yupResolver(validationSchema),
    mode: "onBlur",
    defaultValues: {
      meterNumber: "",
      paymentType: "",
      amount: 0,
      unit: 0,
    },
  });

  const meterNumber = getValues("meterNumber");

  const paymentType = watch("paymentType") as string;

  useEffect(() => {
    if (paymentType === "wallet") {
      setValue("unit", 0);
    } else if (paymentType === "offline") {
      setValue("amount", 0);
    }
  }, [paymentType, setValue]);

  useEffect(() => {
    setValue("meterNumber", meterNumber);
  }, [meterNumber, setValue]);

  const editMeterMutation = useMutation({
    mutationFn: async (reqData) => {
      return axiosInstance.post(`/topups/merchant/topup-with-wallet`, reqData);
    },
    onError: (error: any) => {
      // This only console.logged, so a failed wallet top-up gave the user no
      // feedback at all — the dialog just sat there.
      const problem = parseApiError(error);
      if (applyFieldErrors(problem, setError, Object.keys(getValues() ?? {}))) {
        toast.error(toastMessage(problem));
      }
    },
    onSuccess(data) {
      queryClient.invalidateQueries({ queryKey: ["meters"] });
      setResponse(data.data.data.data);
      if (data.data.data.data.status === "success") {
        setToken(data.data.data.data.token);
        setOpenSuccessModal(true);
      } else if (data.data.data.data.status === "pending") {
        setPendingTranxMessage(data.data.message);
        setShowPendingTranxModal(true);
      }
    },
  });

  const metersQuery = useMutation({
    mutationFn: async () => {
      return axiosInstance.get(`/meters?search=${meterNumber}`);
    },
    onError: (error: any) => {
      const problem = parseApiError(error);
      // Field errors render under their input; only a failure that maps to
      // nothing gets a toast. See architecture/10-api-errors.md.
      if (applyFieldErrors(problem, setError, Object.keys(getValues() ?? {}))) {
        toast.error(toastMessage(problem));
      }
    },
    onSuccess(data) {
      if (data?.data?.data?.data?.length == 0 || !data?.data?.data?.data) {
        toast.error("Meter Not found");
      } else {
        setMeter(data?.data?.data?.data[0]);
      }
      queryClient.invalidateQueries({ queryKey: ["meters"] });
    },
  });

  const onSubmit = (data: any) => {
    const reqData = {
      meterNumber: data.meterNumber,
      topupAmount:
        data.amount == null ? 0 : parseFloat(data.amount as unknown as string),
      paymentType: data.paymentType,
      unit: data.unit == null ? 0 : parseFloat(data.unit as unknown as string),
    };

    if (
      data?.paymentType === "wallet" &&
      (data.amount == null || !data.amount)
    ) {
      toast.error("Amount is required!");
      return;
    }

    if (data?.paymentType === "offline" && (data.unit == null || !data.unit)) {
      toast.error("Amount is required!");
      return;
    }

    if (data?.paymentType === "wallet" && data.amount < 100) {
      toast.error("Amount must be greater than ₦100");
      return;
    }

    if (data?.paymentType === "offline" && data.unit < 10) {
      toast.error("Unit must be greater than 10");
      return;
    }

    if (meter?.meterNumber) {
      editMeterMutation.mutate(reqData as any);
    } else {
      metersQuery.mutate();
    }
  };

  return (
    <section>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-5">
          <Textfield
            type="text"
            id="meterNumber"
            label="Meter number"
            placeholder="Enter meter number"
            register={register}
            error={errors.meterNumber?.message}
          />

          <Controller
            name="paymentType"
            control={control}
            render={({ field }) => (
              <SelectInput
                options={formattedaymentType}
                id="paymentType"
                label="Payment Type"
                isClearable
                placeholder="Select Payment Type"
                isLoading={false}
                onChange={(value) => field.onChange(value)}
                value={field.value as any}
                error={errors.paymentType?.message}
              />
            )}
          />

          {paymentType != "" && (
            <>
              {" "}
              {paymentType == "wallet" ? (
                <Textfield
                  type="number"
                  id="amount"
                  label="Enter amount"
                  placeholder="Enter amount"
                  register={register}
                  error={errors.amount?.message}
                />
              ) : (
                <Controller
                  name="unit"
                  control={control}
                  render={({ field }) => (
                    <DurationInput
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.unit?.message}
                    />
                  )}
                />
              )}
            </>
          )}
        </div>

        {meter?.meterNumber && (
          <div className="my-5 relative border">
            <button
              onClick={() => {
                setValue("meterNumber", "");
                setMeter({});
              }}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              aria-label="Cancel"
            >
              ✖ï¸
            </button>

            <MeterCards source={"topup"} meters={[meter]} />
          </div>
        )}

        <div className="mt-12">
          <Button
            type="submit"
            text={`${meter?.meterNumber ? "Submit" : "Proceed"}`}
            isLoading={editMeterMutation.isLoading || metersQuery.isLoading}
            width="100%"
          />
        </div>
      </form>
      {openSuccessModal && (
        <Modal
          open={true}
          setOpen={setOpenSuccessModal}
          onCloseAction={() => setOpenSuccessModal(false)}
        >
          <TopupSuccess
            token={token}
            meter={meter}
            closeModal={() => setOpenSuccessModal(false)}
            response={response}
          />
        </Modal>
      )}
      <NotificationModal
        open={showPendingTranxModal}
        setOpen={setShowPendingTranxModal}
        onCloseAction={closeSlideOver}
        title="Info"
        type="info"
      >
        {pendingTranxMessage}
      </NotificationModal>
    </section>
  );
}
