import { Search } from "lucide-react";
import type { FieldValues, UseFormRegister } from "react-hook-form";

interface SearchInputProps {
  placeholder: string;
  id: string;
  register?: UseFormRegister<FieldValues>;
  [key: string]: any;
}

export default function SearchInput({
  placeholder,
  id,
  register,
  ...rest
}: SearchInputProps) {
  return (
    <div className="mt-2 relative rounded-md">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search
          className="h-4 w-4 text-gray-700"
          aria-hidden="true"
        />
      </div>

      <input
        id={id}
        type="search"
        placeholder={placeholder}
        {...(register ? register(id) : {})}
        {...rest}
        className="w-full rounded-md border-0 py-1.5 pl-10 ring-1 ring-gray-300 hover:ring-gray-400 placeholder:text-gray-700 focus:ring-1 focus:ring-gray-300 text-[0.8rem] leading-6"
      />
    </div>
  );
}
