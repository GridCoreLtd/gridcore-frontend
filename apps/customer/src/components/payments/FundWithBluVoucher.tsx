import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { object, ObjectSchema, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@gridcore/ui/components/Button";
import Textfield from "../shared/Textfield";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axios-instance";
import Modal from "@gridcore/ui/components/overlays/Modal";
import NotificationModal from "@gridcore/ui/components/overlays/NotificationModal";
import { AxiosError } from "axios";
import { IErrorResponse, ISuccessResponse } from "@/interface";
import { applyFieldErrors, parseApiError } from "@gridcore/api-client";

interface FundBluVoucherForm {
  pin: string;
}

const validationSchema: ObjectSchema<FundBluVoucherForm> = object({
  pin: string().required("Voucher PIN is required"),
});

const FundWithBluVoucher = () => {
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    getValues,
  } = useForm<FundBluVoucherForm>({
    resolver: yupResolver(validationSchema),
    mode: "onBlur",
  });

  const fundWalletMutation = useMutation<
    ISuccessResponse,
    AxiosError<IErrorResponse>,
    FundBluVoucherForm
  >({
    mutationFn: (reqData: FundBluVoucherForm) => {
      return axiosInstance.post("/wallets/fund-with-voucher", reqData);
    },

    onError: (error) => {
      // Was hand-rolling the legacy `{ errors: { field: [msg] } }` shape and
      // would throw on a network failure. parseApiError handles that shape,
      // the new problem+json contract, and no-response failures alike.
      const problem = parseApiError(error);
      if (applyFieldErrors(problem, setError, Object.keys(getValues() ?? {}))) {
        setError("root", { message: problem.detail });
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setOpenModal(false);
      setShowNotifModal(true);
    },
  });

  const onSubmit = (data: FundBluVoucherForm) => {
    fundWalletMutation.mutate(data);
  };

  const handleTriggerClick = () => {
    setOpenModal(true);
  };

  return (
    <>
      <button
        onClick={handleTriggerClick}
        className="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-hidden focus-visible:ring-3 focus-visible:ring-orange-500/50 text-left w-full"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          <img
            src="/icons/bluvoucher.png"
            alt="bluvoucer logo"
            className="w-full h-full"
          />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-900">BluVoucher</p>
          <p className="text-sm text-gray-500">
            Fund using your Voucher serial and PIN
          </p>
        </div>
      </button>

      {openModal && (
        <Modal open={true} setOpen={setOpenModal}>
          <section>
            <h2 className="text-2xl font-medium mb-2">Fund with BluVoucher</h2>
            <div className="text-accent text-sm mb-6">
              Please enter the Voucher details to fund your wallet
            </div>
            {errors.root?.message && (
              <div className="text-red-500 text-sm pb-2">
                {errors.root?.message}
              </div>
            )}
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-4"
            >

              <Textfield
                type="text"
                id="pin"
                label="PIN"
                placeholder="Enter PIN"
                register={register}
                error={errors.pin?.message}
              />

              <div className="mt-8">
                <Button
                  type="submit"
                  text="Submit"
                  width="200px"
                  isLoading={fundWalletMutation.isLoading}
                />
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
        {fundWalletMutation.data?.data?.message}
      </NotificationModal>
    </>
  );
};

export default FundWithBluVoucher;
