
import React from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { number, object, string } from "yup";
import type { ObjectSchema} from "yup";

import Button from "@gridcore/ui/components/Button";
import SelectInput from "@/components/shared/SelectInput";
import Textfield from "@/components/shared/Textfield";
import { applyFieldErrors, parseApiError, toastMessage } from "@gridcore/api-client";
import axiosInstance from "@/utils/axios-instance";

interface EditMeterProps {
  meter: any;
  closeSlideOver: () => void;
  showNotification: (message: string) => void;
}

interface MeterForm {
  meterNumber: string;
  meterAddress: string;
  tariff: number;
  tariffIndex: number;
  meterType: string;
  meterBrand: string;
  accountNumber?: string | null;
  amrCustomerId?: string | null;
}

export function EditMeter({
  meter,
  closeSlideOver,
  showNotification,
}: EditMeterProps) {
  const queryClient = useQueryClient();

  const { data: meterTypes, isFetching: isMeterTypesFetching } = useQuery({
    queryKey: ["meterTypes"],
    queryFn: async () => {
      const res = await axiosInstance.get("/meters/types");
      return res.data.data.data;
    },
  });

  const { data: meterBrands, isFetching: isBrandTypesFetching } = useQuery({
    queryKey: ["meterBrands"],
    queryFn: async () => {
      const res = await axiosInstance.get("/meters/brands");
      return res.data.data.data;
    },
  });

  const formattedMeterTypes = meterTypes?.map((meterType: any) => ({
    value: meterType,
    label: meterType,
  }));

  const formattedMeterBrands = meterBrands?.map((meterBrand: any) => ({
    value: meterBrand,
    label: `${meterBrand} METER`,
  }));

  const validationSchema: ObjectSchema<MeterForm> = object({
    meterNumber: string().required("Meter number is required"),
    meterAddress: string().required("Meter address is required"),
    tariffIndex: number()
      .transform((value, originalValue) => {
        return originalValue === "" ? undefined : value;
      })
      .min(1, "Tariff index must be at least 1")
      .max(99, "Tariff index must be at most 99")
      .required("Tariff index is required"),
    tariff: number()
      .transform((value, originalValue) => {
        return originalValue === "" ? undefined : value;
      })
      .required("Tariff is required"),
    meterType: string().required("Meter type is required"),
    meterBrand: string().required("Meter type is required"),
    accountNumber: string().nullable().optional(),
    amrCustomerId: string().nullable().optional(),
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setError,
    getValues,
  } = useForm<MeterForm>({
    resolver: yupResolver(validationSchema),
    mode: "onBlur",
    defaultValues: {
      meterNumber: meter?.meterNumber,
      meterAddress: meter?.meterAddress,
      tariff: meter?.tariff,
      tariffIndex: meter?.tariffIndex,
      meterType: meter?.meterType,
      meterBrand: meter?.meterBrand,
      accountNumber: meter?.accountNumber,
      amrCustomerId: meter?.amrCustomerId,
    },
  });

  const editMeterMutation = useMutation({
    mutationFn: async (reqData) => {
      return axiosInstance.patch(`/meters/${meter.id}`, reqData);
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
      closeSlideOver();
      showNotification(data.data.message);
    },
  });

  const onSubmit = (data: MeterForm) => {
    const reqData = {
      meterNumber: data.meterNumber,
      meterAddress: data.meterAddress,
      tariff: data.tariff,
      tariffIndex: data.tariffIndex,
      meterType: data.meterType,
      meterBrand: data.meterBrand,
      accountNumber: data.accountNumber == "" ? null : data.accountNumber,
      amrCustomerId: data.amrCustomerId,
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
            error={errors.meterNumber?.message}
          />

          <Textfield
            type="text"
            id="amrCustomerId"
            label="Meter AMR/LORA Id"
            placeholder="Enter AMR/LORA meter Id"
            register={register}
            error={errors.amrCustomerId?.message}
          />

          {meter?.accountNumber && (
            <Textfield
              type="text"
              id="accountNumber"
              label="Account number"
              placeholder="Enter account number"
              register={register}
              error={errors.accountNumber?.message}
            />
          )}

          <Textfield
            type="text"
            id="meterAddress"
            label="Meter address"
            placeholder="Enter meter address"
            register={register}
            error={errors.meterAddress?.message}
          />

          <div className="grid grid-cols-2 gap-x-6">
            <Textfield
              type="number"
              id="tariffIndex"
              label="Tariff index"
              placeholder="Enter the tariff index"
              register={register}
              error={errors.tariffIndex?.message}
              min={1}
              max={99}
              onChange={(e: any) => {
                let value = parseInt(e.target.value);
                if (value < 1) {
                  value = 1;
                } else if (value > 99) {
                  value = 99;
                }
                e.target.value = value.toString();
              }}
            />

            <Textfield
              type="number"
              id="tariff"
              label="Tariff"
              placeholder="Enter the tariff"
              register={register}
              error={errors.tariff?.message}
            />
          </div>

          <Controller
            name="meterType"
            control={control}
            defaultValue={meter?.meterType}
            render={({ field }) => (
              <SelectInput
                options={formattedMeterTypes}
                id="meterType"
                label="Meter type"
                isClearable
                placeholder="Select meter type"
                isLoading={isMeterTypesFetching}
                onChange={(value) => field.onChange(value)}
                value={field.value as any}
                error={errors.meterType?.message}
              />
            )}
          />

          <Controller
            name="meterBrand"
            control={control}
            defaultValue={meter?.meterBrand}
            render={({ field }) => (
              <SelectInput
                options={formattedMeterBrands}
                id="meterBrand"
                label="Meter brand"
                isClearable
                placeholder="Select meter brand"
                isLoading={isBrandTypesFetching}
                onChange={(value) => field.onChange(value)}
                value={field.value as any}
                error={errors.meterBrand?.message}
              />
            )}
          />
        </div>

        <div className="mt-12">
          <Button
            type="submit"
            text="Submit"
            isLoading={editMeterMutation.isLoading}
            width="150px"
          />
        </div>
      </form>
    </section>
  );
}
