import type React from "react";

import type { Control} from "react-hook-form";
import { Controller } from "react-hook-form";

import SelectInput from "@/components/shared/SelectInput";

interface FilterByTransactionStatusProps {
  control: Control;
  name: string;
  placeholder?: string;
}

const FilterByTransactionStatus: React.FC<FilterByTransactionStatusProps> = ({
  control,
  name,
  placeholder = "Filter by transaction type",
}) => {


  const transactionType = [
    {
      value: "ENGINEERING_TOKEN",
      label: "ENGINEERING TOKEN",
    },
    {
      value: "TOPUP",
      label: "TOPUP",
    },
    {
      value: "FUNDING",
      label: "FUNDING",
    },
    {
      value: "REFUND",
      label: "REFUND",
    },
    {
      value: "PAYOUT",
      label: "PAYOUT",
    },
    {
      value: "DEBT_PAID",
      label: "DEBT PAID",
    },
  ];
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <SelectInput
          options={transactionType}
          id={name}
          isClearable
          isLoading={false}
          placeholder={placeholder}
          onChange={(value) => field.onChange(value)}
        />
      )}
    />
  );
};

export default FilterByTransactionStatus;
