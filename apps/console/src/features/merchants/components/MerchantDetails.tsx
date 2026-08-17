
import { useEffect, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import Button from "@gridcore/ui/components/Button";
import { parseApiError, toastMessage } from "@gridcore/api-client";
import axiosInstance from "@/utils/axios-instance";

import EditMerchant from "./EditMerchant";

export default function MerchantDetails({ merchant }: any) {
  const [isEdit, setIsEdit] = useState(false);
  const queryClient = useQueryClient();
  const [vendingDisabled, setVendingDisabled] = useState(
    merchant?.vendingDisabled
  );
  const [divertFundToPaygo, setDivertFundToPaygo] = useState(
    merchant?.divertFundToPaygo
  );
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    setVendingDisabled(merchant?.vendingDisabled);
  }, [merchant?.vendingDisabled]);

  useEffect(() => {
    setDivertFundToPaygo(merchant?.divertFundToPaygo);
  }, [merchant?.divertFundToPaygo]);

  const editMerchantMutation = useMutation({
    mutationFn: async (reqData: {
      vendingDisabled?: boolean;
      divertFundToPaygo?: boolean;
    }) => {
      return axiosInstance.patch(`/merchants/${merchant.id}`, reqData);
    },
    onError: (error: any) => {
      toast.error(toastMessage(parseApiError(error)));
    },
    onSuccess(data) {
      toast.success(data.data.message);
      queryClient.invalidateQueries({ queryKey: ["merchant-detail"] });
      toast.success("Merchant profile updated successfully");
    },
  });

  return (
    <section className="py-8 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between md:items-end">
        <h1 className="text-xl font-bold">Business Details</h1>

        <div className="flex gap-2">
          <Button
            text={`${
              editMerchantMutation?.isLoading
                ? "Loading..."
                : divertFundToPaygo
                  ? "Disable Fund Diversion"
                  : "Enable Fund Diversion"
            }`}
            onClick={() => {
              const payload = {
                divertFundToPaygo: !divertFundToPaygo,
              };
              editMerchantMutation.mutate(payload);
            }}
            height="40px"
            width="200px"
            variant={divertFundToPaygo ? "destructive" : "success"}
          />
          <Button
            text={`${
              editMerchantMutation?.isLoading
                ? "Loading..."
                : vendingDisabled
                  ? "Enable Vending"
                  : "Disable Vending"
            }`}
            onClick={() => {
              const payload = {
                vendingDisabled: !vendingDisabled,
              };
              editMerchantMutation.mutate(payload);
            }}
            height="40px"
            width="150px"
            variant={vendingDisabled ? "success" : "destructive"}
          />
          <Button
            text="Edit Merchant"
            onClick={() => setIsEdit(true)}
            height="40px"
            width="150px"
          />
        </div>
      </div>

      <div className="mt-12 grid sm:grid-cols-3 gap-8">
        <div className="space-y-1.5 col-span-full">
          <div className="text-sm text-gray-500">Business Logo</div>
          {merchant?.businessLogo && !logoFailed ? (
            <img
              src={merchant.businessLogo}
              alt={merchant?.businessName || "Business logo"}
              width={100}
              height={100}
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <div className="text-lg font-semibold text-gray-800">
              {merchant?.businessName || "—"}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="text-sm text-gray-500">Business Name</div>
          <div className="font-medium">{merchant?.businessName}</div>
        </div>

        <div className="space-y-1.5">
          <div className="text-sm text-gray-500">Short Business Name</div>
          <div className="font-medium">{merchant?.shortBusinessName}</div>
        </div>

        <div className="space-y-1.5">
          <div className="text-sm text-gray-500">Contact Email</div>
          <div className="font-medium">{merchant?.contactEmail}</div>
        </div>

        <div className="space-y-1.5">
          <div className="text-sm text-gray-500">Business Website</div>
          <div className="font-medium">{merchant?.businessWebsite}</div>
        </div>

        <div className="space-y-1.5">
          <div className="text-sm text-gray-500">Business Address</div>
          <div className="font-medium">{merchant?.businessAddress}</div>
        </div>

        <div className="space-y-1.5">
          <div className="text-sm text-gray-500">CAC Certificate</div>
          <a
            href={merchant?.cacDocument}
            target="_blank"
            className="underline text-primary font-medium" rel="noreferrer"
          >
            Click here to view
          </a>
        </div>

        <div className="space-y-1.5">
          <div className="text-sm text-gray-500">Business Description</div>
          <div className="font-medium">{merchant?.businessDescription}</div>
        </div>

        <div className="space-y-1.5">
          <div className="text-sm text-gray-500">Merchant Type</div>
          <div className="font-medium">{merchant?.merchantType}</div>
        </div>
      </div>

      {isEdit && (
        <div className="mt-16">
          <EditMerchant
            merchant={merchant}
            closeEdit={() => setIsEdit(false)}
          />
        </div>
      )}
    </section>
  );
}
