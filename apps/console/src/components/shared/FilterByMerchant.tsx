import type React from "react";

import { useQuery } from "@tanstack/react-query";
import type { Control} from "react-hook-form";
import { Controller } from "react-hook-form";

import SelectInput from "@/components/shared/SelectInput";
import axiosInstance from "@/utils/axios-instance";

interface FilterByMerchantProps {
  control: Control;
  name: string;
  placeholder?: string;
}

const FilterByMerchant: React.FC<FilterByMerchantProps> = ({
  control,
  name,
  placeholder = "Filter by merchant",
}) => {
  const { data: merchants, isFetching: isMerchantsFetching } = useQuery({
    queryKey: ["merchants"],
    queryFn: async () => {
      const res = await axiosInstance.get("/merchants?page=1&perPage=1000");
      return res.data.data.data;
    },
  });

  const formattedMerchants =
    merchants?.map((merchant: any) => ({
      value: merchant.id,
      label: merchant.businessName,
    })) || [];

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <SelectInput
          options={formattedMerchants}
          id={name}
          isClearable
          isLoading={isMerchantsFetching}
          placeholder={placeholder}
          onChange={(value) => field.onChange(value)}
        />
      )}
    />
  );
};

export default FilterByMerchant;
