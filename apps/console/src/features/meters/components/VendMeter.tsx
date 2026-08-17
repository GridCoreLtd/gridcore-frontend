
import React, { useEffect, useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { object, string } from "yup";
import type { ObjectSchema} from "yup";

import Button from "@gridcore/ui/components/Button";
import NotificationModal from "@gridcore/ui/components/overlays/NotificationModal";
import Textfield from "@/components/shared/Textfield";
import { applyFieldErrors, parseApiError, toastMessage } from "@gridcore/api-client";
import axiosInstance from "@/utils/axios-instance";

interface VendMeterProps {
  closeSlideOver: () => void;
  meterId?: string;
}

interface MeterForm {
  meterNumber: string;
  meterToken: string;
}

export function VendMeter({ closeSlideOver, meterId = "" }: VendMeterProps) {
  const queryClient = useQueryClient();

  const [pendingTranxMessage, setPendingTranxMessage] = useState("");
  const [showPendingTranxModal, setShowPendingTranxModal] = useState(false);

  const validationSchema: ObjectSchema<MeterForm> = object({
    meterNumber: string().required("Meter number is required"),
    meterToken: string().required("Payment type is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    setError,
  } = useForm<MeterForm>({
    resolver: yupResolver(validationSchema),
    mode: "onBlur",
    defaultValues: {
      meterNumber: meterId,
      meterToken: "",
    },
  });

  const meterNumber = getValues("meterNumber");

  useEffect(() => {
    setValue("meterNumber", meterNumber);
  }, [meterNumber, setValue]);

  useEffect(() => {
    setValue("meterNumber", meterId);
  }, [meterId, setValue]);

  const editMeterMutation = useMutation({
    mutationFn: async (reqData) => {
      return axiosInstance.post(`/topups/merchant/vend-meter`, reqData);
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
      queryClient.invalidateQueries({ queryKey: ["meters"] });

      if (data?.data?.success) {
        toast.success(data?.data?.message || "done");
      } else {
        toast.error(data?.data?.message || "done");
      }
    },
  });

  const onSubmit = (data: any) => {
    const reqData = {
      meterNumber: data.meterNumber,
      meterToken: data.meterToken,
    };

    editMeterMutation.mutate(reqData as any);
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
            error={errors.meterToken?.message}
          />
        </div>
        <div className="space-y-5 mt-4">
          <Textfield
            type="text"
            id="meterToken"
            label="Meter token"
            placeholder="Enter token"
            register={register}
            error={errors.meterNumber?.message}
          />
        </div>

        <div className="mt-12">
          <Button
            type="submit"
            text={`${meterNumber ? "Submit" : "Proceed"}`}
            isLoading={editMeterMutation.isLoading}
            width="100%"
          />
        </div>
      </form>
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
