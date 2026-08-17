import type React from "react";

import classNames from "classnames";
import type { UseFormRegister } from "react-hook-form";

interface TextareaProps {
  id: string;
  label?: string;
  error?: string | undefined;
  InputIcon?: any;
  width?: string;
  height?: string;
  placeholder?: string;
  rows?: number;
  register?: UseFormRegister<any>;
  dense?: boolean;

  [key: string]: any;
}

const Textarea = ({
  id,
  label,
  error,
  InputIcon,
  width,
  height,
  placeholder,
  rows = 4,
  register,
  dense = false,
  ...rest
}: TextareaProps) => {
  const style: React.CSSProperties = {};
  width ? (style.width = width) : (style.width = "100%");
  if (height) {
    style.height = height;
  }

  return (
    <div>
      {label && !dense && (
        <label htmlFor={id} className="block text-sm font-medium leading-6">
          {label}
        </label>
      )}

      <div className={`relative rounded-md ${dense ? "" : "mt-2"}`}>
        {InputIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <InputIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
          </div>
        )}

        <textarea
          id={id}
          placeholder={placeholder}
          rows={rows}
          {...(register ? register(id) : {})}
          {...rest}
          style={style}
          className={classNames(
            InputIcon ? "pl-10" : "px-3",
            "block rounded-md border-0 py-1.5 ring-1 ring-gray-300 hover:ring-gray-400 placeholder:text-gray-300 focus:ring-1 focus:ring-gray-300 text-sm leading-6",
          )}
        />
      </div>

      {error && !dense && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
};

export default Textarea;
