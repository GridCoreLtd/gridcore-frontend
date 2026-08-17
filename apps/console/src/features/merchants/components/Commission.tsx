import React from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { number, object } from "yup";
import type { ObjectSchema } from "yup";

import Button from "@gridcore/ui/components/Button";
import Textfield from "@/components/shared/Textfield";
import { applyFieldErrors, parseApiError, toastMessage } from "@gridcore/api-client";
import axiosInstance from "@/utils/axios-instance";

interface CommissionForm {
  paygoCommission: number;
}

export default function Commission({ merchant }: any) {
  const validationSchema: ObjectSchema<CommissionForm> = object({
    paygoCommission: number().required("Commission is required").positive(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    getValues,
  } = useForm<CommissionForm>({
    defaultValues: {
      paygoCommission: merchant.paygoCommission,
    },
    resolver: yupResolver(validationSchema),
  });

  const commissionMutation = useMutation({
    mutationFn: async (reqData) => {
      return axiosInstance.patch(`/merchants/${merchant.id}`, reqData);
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
      toast.success(data.data.message);
    },
  });

  const onSubmit = (reqData: any) => {
    commissionMutation.mutate(reqData as any);
  };

  return (
    <section className="bg-gray-100 ring-1 shadow-xs ring-gray-300 rounded-md p-5 sm:p-6">
      <h2 className="text-lg font-medium mb-1">Commission</h2>
      <div className="text-accent text-xs mb-4">
        Please indicate the commission you want Paygo Dash to earn on each
        transaction of this merchant
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex gap-4">
          <div className="relative rounded-md flex-1">
            <Textfield
              type="number"
              id="paygoCommission"
              dense={true}
              height="40px"
              placeholder="Enter percentage commission"
              register={register}
              error={errors.paygoCommission?.message}
            />

            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 bg-gray-200">
              <span className="sm:text-sm font-bold">%</span>
            </div>
          </div>

          <Button
            type="submit"
            text="Save"
            width="120px"
            isLoading={commissionMutation.isLoading}
          />
        </div>
      </form>
    </section>
  );
}
