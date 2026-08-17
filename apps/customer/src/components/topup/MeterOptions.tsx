import { useState } from "react";
import {
  RadioGroup,
  RadioGroupItem,
} from "@gridcore/ui/components/ui/radio-group";
import classNames from "classnames";
// import { MeterTypes } from "../analytics/Analytics";
import Button from "@gridcore/ui/components/Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axios-instance";
import { toast } from "react-toastify";
import { parseApiError, toastMessage } from "@gridcore/api-client";
import { bankChannels } from "@gridcore/ui/lib/format"; // Ensure this contains WEMA and TITAN

interface Meter {
  id: string;
  meterNumber: string;
  meterAddress: string;
  meterType: string;
  meterBrand: string;
  accountNumber: string;
  titanAccountNumber: string;
}

interface MetersProps {
  meters: Meter[];
  selectedMeter: any;
  setSelectedMeter: (selected: any) => void;
}

export default function MeterOptions({
  meters,
  selectedMeter,
  setSelectedMeter,
}: MetersProps) {
  const queryClient = useQueryClient();

  // Track loading states per meter and account type (Wema & Titan)
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});

  const generateAccountNo = useMutation({
    mutationFn: async (data: { meterNumber: string; channel: string }) => {
      const endpoint = `/auth/generate-account-number/${data.meterNumber}/${data.channel}`;
      return axiosInstance.post(
        endpoint,
        {},
        { headers: { handleErrorLocally: true } },
      );
    },
    onMutate: (data) => {
      // Set loading state for the specific meter and bank channel
      setLoadingStates((prev) => ({
        ...prev,
        [`${data.meterNumber}-${data.channel}`]: true,
      }));
    },
    onError: (error: any, data) => {
      toast.error(toastMessage(parseApiError(error)));
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast.success("Account Number Generated.");

      // Reset loading state after success
      setLoadingStates((prev) => ({
        ...prev,
        [`${variables.meterNumber}-${variables.channel}`]: false,
      }));
    },
  });

  return (
    <RadioGroup
      value={selectedMeter?.id ?? ""}
      onValueChange={(id) =>
        setSelectedMeter(meters?.find((m) => String(m.id) === id))
      }
      aria-label="Meters"
      className="gap-0 rounded-md bg-white"
    >
      <div className="rounded-md bg-white">
        {meters?.map((meter, meterIdx) => {
          // Radix radios carry string values, so the id addresses the row and
          // the parent still receives the whole meter object.
          const checked = String(selectedMeter?.id) === String(meter.id);
          const inputId = `meter-${meter.id}`;

          return (
            <div
              key={`${meterIdx}-${meter.id}`}
              className={classNames(
                meterIdx === 0 ? "rounded-tl-md rounded-tr-md" : "",
                meterIdx === meters.length - 1
                  ? "rounded-bl-md rounded-br-md"
                  : "",
                checked
                  ? "z-10 border-indigo-200 bg-indigo-50"
                  : "border-gray-200",
                "relative flex border p-4",
              )}
            >
              {/*
               * The radio is its own control rather than the whole row: the
               * row also holds "Generate account number" buttons, and a button
               * inside a button is invalid markup that swallows the clicks.
               */}
              <RadioGroupItem
                value={String(meter.id)}
                id={inputId}
                className="mt-0.5 shrink-0"
              />

                {/* Generate Wema Account Number Button */}
                {!meter?.accountNumber && (
                  <div className="ml-2 absolute right-1 top-1">
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
                      onClick={() =>
                        generateAccountNo.mutate({
                          meterNumber: meter.meterNumber,
                          channel: bankChannels.WEMA,
                        })
                      }
                      width="200px"
                      height="30px"
                      variant="success"
                    />
                  </div>
                )}

                {/* Generate Titan Account Number Button */}
                {!meter?.titanAccountNumber && (
                  <div className="ml-2 absolute right-1 bottom-1">
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
                      onClick={() =>
                        generateAccountNo.mutate({
                          meterNumber: meter.meterNumber,
                          channel: bankChannels.TITAN,
                        })
                      }
                      width="200px"
                      height="30px"
                      variant="warning"
                    />
                  </div>
                )}

                <label htmlFor={inputId} className="ml-3 flex cursor-pointer flex-col">
                  <div className="text-sm">
                    <span className="font-bold mr-2">Meter Number:</span>
                    <span>{meter.meterNumber}</span>
                  </div>

                  <div className="text-sm mt-1">
                    <span className="font-bold mr-2">Meter Address:</span>
                    <span>{meter.meterAddress}</span>
                  </div>

                  <div className="text-sm mt-1">
                    <span className="font-bold mr-2">Meter Type:</span>
                    <span>{meter.meterType}</span>
                  </div>

                  <div className="text-sm mt-1">
                    <span className="font-bold mr-2">Meter Brand:</span>
                    <span>{meter.meterBrand}</span>
                  </div>

                  {(meter?.accountNumber || meter?.titanAccountNumber) && (
                    <div className="text-sm mt-1">
                      <span>Dedicated Virtual Accounts</span>
                    </div>
                  )}

                  {meter?.accountNumber && (
                    <div className="text-sm mt-1">
                      <span className="font-bold mr-2">
                        Wema Account Number:
                      </span>
                      <span>{meter?.accountNumber ?? "N/A"}</span>
                    </div>
                  )}

                  {meter?.titanAccountNumber && (
                    <div className="text-sm mt-1">
                      <span className="font-bold mr-2">
                        Paystack-Titan Account Number:
                      </span>
                      <span>{meter?.titanAccountNumber ?? "N/A"}</span>
                    </div>
                  )}
                </label>
            </div>
          );
        })}
      </div>
    </RadioGroup>
  );
}
