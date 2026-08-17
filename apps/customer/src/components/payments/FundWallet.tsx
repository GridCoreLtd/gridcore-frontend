
import { useState } from "react";

import { ChevronDown } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@gridcore/ui/components/ui/popover";

import FundWithBluVoucher from "./FundWithBluVoucher";
import FundWithPaystack from "./FundWithPaystack";

const paymentMethods = [
  {
    id: "paystack",
    name: "Paystack",
    description: "Fund with your card, bank transfer, or USSD",
    component: FundWithPaystack,
    supportedCountries: ["NG"],
  },
  {
    id: "bluvoucher",
    name: "BluVoucher",
    description: "Fund with your BluVoucher pin",
    component: FundWithBluVoucher,
    supportedCountries: ["ZA"],
  },
];

const FundWallet = ({ country }: { country: string }) => {
  // The trigger's colours depend on open state, which Radix exposes through
  // the controlled prop rather than a render prop.
  const [open, setOpen] = useState(false);

  const filteredPaymentMethods = paymentMethods.filter(
    (method) =>
      method.supportedCountries.includes("*") ||
      method.supportedCountries.includes(country?.toUpperCase()),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={`
          ${open ? "text-white" : "text-white/90"}
          group inline-flex items-center rounded-md bg-secondary px-6 py-3 text-base font-medium hover:text-white focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white/75 shadow-xs
        `}
      >
        <span>Fund Wallet</span>
        <ChevronDown
          className={`${open ? "text-white" : "text-white/70"}
            ml-2 h-5 w-5 transition duration-150 ease-in-out group-hover:text-white/80`}
          aria-hidden="true"
        />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-screen max-w-sm overflow-hidden p-0"
      >
        <div className="relative grid gap-8 bg-white p-7">
          {filteredPaymentMethods.map((method) => {
            const FundComponent = method.component;
            return <FundComponent key={method.id} />;
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FundWallet;
