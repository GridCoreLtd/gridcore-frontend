import type React from "react";

import type { Control} from "react-hook-form";
import { Controller } from "react-hook-form";

import SelectInput from "@/components/shared/SelectInput";
import Textfield from "@/components/shared/Textfield";

export type FilterType = "select" | "text" | "date" | "number";

export interface FilterOption {
  value: string | number;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: FilterType;
  options?: FilterOption[]; // For select type
  placeholder?: string;
  className?: string;
}

interface FilterInputProps {
  filter: FilterConfig;
  control: Control<any>;
}

export const FilterSelectInput: React.FC<FilterInputProps> = ({
  filter,
  control,
}) => (
  <Controller
    name={filter.key}
    control={control}
    render={({ field }) => (
      <SelectInput
        id={filter.key}
        label={filter.label}
        options={filter.options as any[]}
        isClearable
        placeholder={filter.placeholder || `Select ${filter.label}`}
        {...field}
      />
    )}
  />
);

export const FilterTextInput: React.FC<FilterInputProps> = ({
  filter,
  control,
}) => (
  <Controller
    name={filter.key}
    control={control}
    render={({ field }) => (
      <Textfield
        id={filter.key}
        label={filter.label}
        placeholder={filter.placeholder || `Enter ${filter.label}`}
        type="text"
        {...field}
      />
    )}
  />
);

// Add more input types here as needed (e.g., Date, Number)
