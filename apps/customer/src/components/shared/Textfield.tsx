import classNames from "classnames";
import { UseFormRegister } from "react-hook-form";

interface TextfieldProps {
  type?: string;
  id: string;
  label: string;
  error?: string | undefined;
  InputIcon?: any;
  width?: string;
  placeholder?: string;
  register?: UseFormRegister<any>;
  [key: string]: any;
}

const Textfield = ({
  type,
  id,
  label,
  error,
  InputIcon,
  width,
  placeholder,
  register,
  ...rest
}: TextfieldProps) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium leading-6">
        {label}
      </label>

      <div className="mt-2 relative rounded-md">
        {InputIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <InputIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
          </div>
        )}

        <input
          id={id}
          type={type}
          placeholder={placeholder}
          {...(register ? register(id) : {})}
          {...rest}
          className={classNames(
            InputIcon ? "pl-10" : "px-3",
            `block w-full rounded-md border-0 py-1.5 ring-1 ring-gray-300 hover:ring-gray-400 placeholder:text-gray-300 focus:ring-1 focus:ring-gray-300 text-sm leading-6 ${width}`,
          )}
        />
      </div>

      <p className="text-red-500 text-xs mt-2">{error}</p>
    </div>
  );
};

export default Textfield;
