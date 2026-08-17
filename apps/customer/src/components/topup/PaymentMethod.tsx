import { useEffect } from "react";

import {
  RadioGroup,
  RadioGroupCard,
} from "@gridcore/ui/components/ui/radio-group";

interface PaymentMethodProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  meterType: string;
  country: string;
}

const paymentChannels = [
  {
    text: "My Wallet",
    value: "wallet",
    icon: "/icons/wallet.svg",
    supportedCountries: ["*"],
    meterTypes: ["*"],
  },
  {
    text: "Paystack",
    value: "paystack",
    icon: "/icons/paystack.svg",
    supportedCountries: ["NG"],
    meterTypes: ["ELECTRICITY", "WATER", "GAS", "TIME"],
  },
];

export default function PaymentMethod({
  paymentMethod,
  setPaymentMethod,
  meterType,
  country,
}: PaymentMethodProps) {
  useEffect(() => {
    if (meterType === "OKRA") {
      setPaymentMethod("wallet");
    }
  }, [meterType, setPaymentMethod]);

  const availablePaymentChannels = paymentChannels.filter((channel) => {
    return (
      (channel.supportedCountries.includes("*") ||
        channel.supportedCountries.includes(country?.toUpperCase())) &&
      (channel.meterTypes.includes("*") ||
        channel.meterTypes.includes(meterType?.toUpperCase()))
    );
  });

  return (
    <div>
      {meterType === "" || meterType === undefined ? (
        <>LOADING...</>
      ) : (
        <RadioGroup
          value={paymentMethod}
          onValueChange={setPaymentMethod}
          aria-label="Choose a payment method"
          className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3"
        >
          {availablePaymentChannels.map((paymentChannel) => (
            <RadioGroupCard
              key={paymentChannel.value}
              value={paymentChannel.value}
              className="flex items-center justify-center py-3 px-3 sm:flex-1"
            >
              <span className="flex items-center gap-2">
                <img src={paymentChannel.icon} alt="" className="h-5 w-auto" />
                <span className="text-base">{paymentChannel.text}</span>
              </span>
            </RadioGroupCard>
          ))}
        </RadioGroup>
      )}
    </div>
  );
}
