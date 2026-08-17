
import React, { useEffect, useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { object, string } from "yup";
import type { ObjectSchema} from "yup";

import Button from "@gridcore/ui/components/Button";
import NotificationModal from "@gridcore/ui/components/overlays/NotificationModal";
import Textfield from "@/components/shared/Textfield";
import { applyFieldErrors, parseApiError, toastMessage } from "@gridcore/api-client";
import axiosInstance from "@/utils/axios-instance";

interface ClearMeterTamperProps {
  closeSlideOver: () => void;
  meterId?: string;
  meterBrand?: string;
}

interface MeterForm {
  meterToken: string;
}

export function ClearMeterTamper({
  closeSlideOver,
  meterId,
  meterBrand = "",
}: ClearMeterTamperProps) {
  const queryClient = useQueryClient();

  const [pendingTranxMessage, setPendingTranxMessage] = useState("");
  const [showPendingTranxModal, setShowPendingTranxModal] = useState(false);

  const validationSchema: ObjectSchema<MeterForm> = object({
    meterToken: string().required("Payment type is required"),
  });
  const fetchUserRemoteTamperReadings = async () => {
    const response = await axiosInstance.get(
      `/topups/merchant/token/${meterId}`
    );
    return response.data;
  };

  const {
    data: meterReadingTamper,
    isError: isErrorT,
    isLoading: isLoadingT,
    error,
  } = useQuery({
    queryKey: [`/topups/merchant/token/${meterId}`],
    queryFn: fetchUserRemoteTamperReadings,
    enabled: !!meterId,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchInterval: 0,
    refetchOnReconnect: true,
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    getValues,
  } = useForm<MeterForm>({
    resolver: yupResolver(validationSchema),
    mode: "onBlur",
    defaultValues: {
      meterToken: meterReadingTamper?.data?.token,
    },
  });

  useEffect(() => {
    setValue("meterToken", meterReadingTamper?.data?.token);
  }, [meterReadingTamper?.data?.token, setValue]);

  const temperMutation = useMutation({
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

      if (data?.data?.success && data?.data?.data?.status) {
        toast.success(data?.data?.message || "done");
      } else {
        toast.error(data?.data?.message || "done");
      }
    },
  });

  const onSubmit = (data: any) => {
    const reqData = {
      meterToken: data.meterToken,
      meterNumber: meterId,
    };

    if (!data.meterToken) {
      toast.error("Token is required!");
    }

    temperMutation.mutate(reqData as any);
  };

  return (
    <section>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          {isErrorT && <>{`${error}`}</>}
          {isLoadingT && (
            <>
              <img
                src="/icons/loading-black.png"
                alt="Spinner"
                className="w-4 h-4 animate-spin"
              />
              Loading...
            </>
          )}
        </div>
        <div className="space-y-5 mt-4">
          <Textfield
            type="text"
            id="meterToken"
            label="Meter token"
            placeholder="Enter token"
            register={register}
            error={errors.meterToken?.message}
          />
        </div>

        <div className="mt-12">
          <Button
            type="submit"
            text={`${"Send"}`}
            isLoading={temperMutation.isLoading}
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
