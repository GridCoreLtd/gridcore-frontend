
import type React from "react";
import { useEffect, useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ObjectSchema} from "yup";
import { object, string } from "yup";

import Button from "@gridcore/ui/components/Button";
import SelectInput from "@/components/shared/SelectInput";
import Textfield from "@/components/shared/Textfield";
import { applyFieldErrors, parseApiError, toastMessage } from "@gridcore/api-client";
import axiosInstance from "@/utils/axios-instance";

interface BankForm {
  bankCode: string;
  accountNumber: string;
}

interface NewBankProps {
  /** Omitted, the account is added to the caller's own merchant. */
  merchantId?: string;
  closeSlideOver: () => void;
  showNotification?: (message: string) => void;
}

const NewBank: React.FC<NewBankProps> = ({
  merchantId,
  closeSlideOver,
  showNotification,
}) => {
  const [accountName, setAccountName] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const validationSchema: ObjectSchema<BankForm> = object({
    bankCode: string().required("Bank name is required"),
    accountNumber: string().required("Account number is required"),
  });

  const {
    register,
    watch,
    handleSubmit,
    control,
    formState: { errors },
    setError,
    getValues,
  } = useForm<BankForm>({
    resolver: yupResolver(validationSchema),
    mode: "onBlur",
  });

  const { data: banks, isFetching: isBankFetching } = useQuery({
    queryKey: ["banks"],
    queryFn: async () => {
      const res = await axiosInstance.get("/payments/get-banks");
      return res.data.data.data;
    },
  });

  const formattedBanks =
    banks?.map((bank: any) => ({
      value: bank.code,
      label: bank.name,
    })) || [];

  const bankCodeValue = watch("bankCode");
  const accountNumberValue = watch("accountNumber");

  const resolveBankDetail = async () => {
    try {
      const { data } = await axiosInstance.get(
        `/payments/resolve-bank-account?accountNumber=${accountNumberValue}&bankCode=${bankCodeValue}`
      );
      setAccountName(data.data.data.account_name);
    } catch (error: unknown) {
      // Fires as the user types an account number, so a toast here is both
      // noisy and misplaced — the failure is about this field. It also read
      // `error.response.data.message` unguarded and threw when offline.
      setAccountName("");
      setError("accountNumber", {
        type: "lookup_failed",
        message: parseApiError(error).detail,
      });
    }
  };

  useEffect(() => {
    if (bankCodeValue && accountNumberValue.length === 10) {
      resolveBankDetail();
    }
  }, [bankCodeValue, accountNumberValue]);

  const newBankMutation = useMutation({
    mutationFn: async (reqData) => {
      return axiosInstance.patch(
        merchantId
          ? `/merchants/${merchantId}/add-bank-account`
          : "/merchants/me/add-bank-account",
        reqData
      );
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
      if (showNotification) showNotification("Bank account added successfully");
      else toast.success(data.data.message);
      queryClient.invalidateQueries({ queryKey: ["merchant-detail"] });
      closeSlideOver();
    },
  });

  const onSubmit = (data: any) => {
    const selectedBank = banks.find((bank: any) => bank.code === data.bankCode);

    const reqData = {
      bankCode: data.bankCode,
      bankAccountNumber: data.accountNumber,
      bankAccountName: accountName,
      bankName: selectedBank.name,
    };
    newBankMutation.mutate(reqData as any);
  };

  return (
    <section>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-5">
          <Controller
            name="bankCode"
            control={control}
            render={({ field }) => (
              <SelectInput
                options={formattedBanks}
                id="bankCode"
                label="Bank Name"
                isClearable
                isLoading={isBankFetching}
                placeholder="Select a bank"
                onChange={(value) => field.onChange(value)}
                error={errors.bankCode?.message}
              />
            )}
          />

          <Textfield
            type="text"
            id="accountNumber"
            label="Account Number"
            placeholder="Enter account number"
            register={register}
            error={errors.accountNumber?.message}
          />

          {accountName && (
            <div>
              <div className="block text-sm font-medium leading-6">
                Account Name
              </div>
              <div className="text-sm mt-2">{accountName}</div>
            </div>
          )}
        </div>

        <div className="mt-12">
          <Button
            type="submit"
            text="Submit"
            isDisabled={!accountName}
            isLoading={newBankMutation.isLoading}
            width="200px"
          />
        </div>
      </form>
    </section>
  );
};

export default NewBank;
