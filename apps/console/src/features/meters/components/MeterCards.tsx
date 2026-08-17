import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import Button from "@gridcore/ui/components/Button";
import { parseApiError, toastMessage } from "@gridcore/api-client";
import axiosInstance from "@/utils/axios-instance";
import { bankChannels } from "@gridcore/ui/lib/format";


export default function MeterCards({ meters, source }: any) {
  const queryClient = useQueryClient();

  // State to track loading status per meter and bank channel
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});

  const generateAccountNo = useMutation({
    mutationFn: async (data: { meterNumber: string; channel: string }) => {
      const endpoint = `/auth/generate-account-number/${data?.meterNumber}/${data?.channel}`;
      return axiosInstance.post(
        endpoint,
        {},
        {
          headers: { handleErrorLocally: true },
        }
      );
    },
    onMutate: (data) => {
      setLoadingStates((prev) => ({
        ...prev,
        [`${data.meterNumber}-${data.channel}`]: true,
      }));
    },
    onError: (error: any, data) => {
      // Generating an account number is an action on a card, not a form
      // submission — there is no input to attach this to.
      toast.error(toastMessage(parseApiError(error)));

      // Reset loading state on error
      setLoadingStates((prev) => ({
        ...prev,
        [`${data.meterNumber}-${data.channel}`]: false,
      }));
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customerDetail"] });
      toast.success(data?.data?.message ?? "Account Number Generated.");

      // Reset loading state after success
      setLoadingStates((prev) => ({
        ...prev,
        [`${variables.meterNumber}-${variables.channel}`]: false,
      }));
    },
  });

  return (
    <section>
      <div
        className={`grid relative ${
          source == "topup" ? "" : "grid-cols-1 lg:grid-cols-2 "
        } gap-6`}
      >
        {meters.map((meter: any, index: number) => {
          return (
            <div
              key={index}
              className="relative w-[100%] bg-white ring-1 ring-gray-300 hover:bg-gray-100 rounded-md shadow-xs flex flex-col md:flex-row items-center gap-6 p-6"
            >
              <img
                src="/icons/meter2.svg"
                alt="Meter"
                width={40}
                height="auto"
              />

              <div className="text-sm">
                <div>
                  <span className="font-medium mr-2">Meter Number:</span>
                  <span className="text-gray-500">{meter?.meterNumber}</span>
                </div>

                <div className="mt-1.5">
                  <span className="font-medium mr-2">Meter Address:</span>
                  <span className="text-gray-500">{meter?.meterAddress}</span>
                </div>

                <div className="mt-1.5">
                  <span className="font-medium mr-2">Meter Type:</span>
                  <span className="text-gray-500">{meter?.meterType}</span>
                </div>

                <div className="mt-1.5">
                  <span className="font-medium mr-2">Meter Brand:</span>
                  <span className="text-gray-500">{meter?.meterBrand}</span>
                </div>

                {(meter?.accountNumber || meter?.titanAccountNumber) && (
                  <div className="font-bold mt-1">
                    Dedicated Virtual Accounts
                  </div>
                )}

                {meter?.accountNumber && (
                  <div className="mt-0">
                    <span className="font-medium mr-2">
                      Wema Account Number:
                    </span>
                    <span className="text-gray-500">
                      {meter?.accountNumber}
                    </span>
                  </div>
                )}

                {meter?.titanAccountNumber && (
                  <div className="mt-0">
                    <span className="font-medium mr-2">
                      Paystack-Titan Account Number:
                    </span>
                    <span className="text-gray-500">
                      {meter?.titanAccountNumber}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-start h-full">
                {!meter?.accountNumber && (
                  <div
                    style={{ left: "0px", bottom: "0px" }}
                    className="flex items-start absolute"
                  >
                    <Button
                      text={
                        loadingStates[
                          `${meter.meterNumber}-${bankChannels.WEMA}`
                        ]
                          ? "Generating..."
                          : "Generate Wema A/N"
                      }
                      isLoading={
                        loadingStates[
                          `${meter.meterNumber}-${bankChannels.WEMA}`
                        ]
                      }
                      onClick={() => {
                        const data = {
                          meterNumber: meter.meterNumber,
                          channel: bankChannels.WEMA,
                        };
                        generateAccountNo.mutate(data);
                      }}
                      width="200px"
                      height="20px"
                      variant="success"
                    />
                  </div>
                )}
                {!meter?.titanAccountNumber && (
                  <div
                    style={{ right: "0px", bottom: "0px" }}
                    className="flex items-start absolute"
                  >
                    <Button
                      text={
                        loadingStates[
                          `${meter.meterNumber}-${bankChannels.TITAN}`
                        ]
                          ? "Generating..."
                          : "Generate Titan A/N"
                      }
                      isLoading={
                        loadingStates[
                          `${meter.meterNumber}-${bankChannels.TITAN}`
                        ]
                      }
                      onClick={() => {
                        const data = {
                          meterNumber: meter.meterNumber,
                          channel: bankChannels.TITAN,
                        };
                        generateAccountNo.mutate(data);
                      }}
                      width="200px"
                      height="20px"
                      variant="warning"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
