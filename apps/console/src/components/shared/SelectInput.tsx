import type React from "react";

import type {
  ActionMeta,
  Props as SelectProps,
  StylesConfig,
} from "react-select";
import Select from "react-select";

interface OptionType {
  value: string;
  label: string;
}

interface SelectInputProps extends SelectProps<OptionType, false> {
  id: string;
  options: OptionType[];
  label?: string;
  error?: string | null;
}

const customStyles: StylesConfig<OptionType, false> = {
  control: (provided) => ({
    ...provided,
    borderRadius: "0.375rem",
    borderColor: "rgba(209, 213, 219, 1)",
    boxShadow: "none",
    "&:hover": {
      borderColor: "rgba(209, 213, 219, 1)",
    },
    fontSize: "0.875rem",
  }),
  // placeholder: (provided) => ({
  //   ...provided,
  //   color: "rgb(209 213 219)",
  // }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#2626FD"
      : state.isFocused
      ? "rgba(237, 242, 247, 1)"
      : "transparent",
    color: state.isSelected ? "white" : "rgba(55, 65, 81, 1)",
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: "rgba(107, 114, 128, 1)",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: "0.375rem",
    boxShadow: "0px 10px 15px rgba(0, 0, 0, 0.05)",
    fontSize: "0.875rem",
  }),
  menuPortal: (provided) => ({
    ...provided,
    zIndex: 9999,
  }),
};

const SelectInput: React.FC<SelectInputProps> = ({
  id,
  options,
  label,
  placeholder,
  onChange,
  value,
  error,
  ...selectProps
}) => {
  const handleChange = (
    selectedOption: OptionType | null,
    actionMeta: ActionMeta<OptionType>
  ) => {
    if (onChange) {
      // @ts-expect-error -- onChange is typed for the raw react-select option;
      // this wrapper deliberately hands callers the bare value instead.
      onChange(selectedOption ? selectedOption.value : null);
    }
  };

  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium leading-6 text-gray-900 mb-2"
        >
          {label}
        </label>
      )}

      <Select
        id={id}
        options={options}
        styles={customStyles}
        menuPortalTarget={
          typeof document !== "undefined" ? document.body : undefined
        }
        menuPosition="fixed"
        placeholder={placeholder}
        onChange={handleChange}
        value={
          options
            ? options.find(
                (option) => typeof value === "string" && option.value === value
              )
            : null
        }
        {...selectProps}
      />

      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
};

export default SelectInput;
