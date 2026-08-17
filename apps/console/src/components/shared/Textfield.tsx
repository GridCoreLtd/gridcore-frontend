import type React from "react";

import classNames from "classnames";
import type { UseFormRegister } from "react-hook-form";

interface TextfieldProps {
  type?: string;
  id: string;
  label?: string;
  error?: string | undefined;
  InputIcon?: any;
  /** Rendered inside the field, on the right — a reveal toggle, a unit, a hint. */
  endSlot?: React.ReactNode;
  width?: string;
  height?: string;
  placeholder?: string;
  register?: UseFormRegister<any>;
  dense?: boolean;

  [key: string]: any;
}

const Textfield = ({
  type,
  id,
  label,
  error,
  InputIcon,
  endSlot,
  width,
  height,
  placeholder,
  register,
  dense = false,
  ...rest
}: TextfieldProps) => {
  const style: React.CSSProperties = {};
  width ? (style.width = width) : (style.width = "100%");
  if (height) {
    style.height = height;
  }

  const isCheckBox = type == "checkbox";
  const errorId = `${id}-error`;

  return (
    <div>
      {label && !dense && (
        <label htmlFor={id} className="block text-sm font-medium leading-6">
          {label}
        </label>
      )}

      <div
        className={`relative rounded-md ${dense ? "" : isCheckBox ? "" : "mt-2"}`}
      >
        {InputIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <InputIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </div>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          {...(register ? register(id) : {})}
          {...rest}
          style={!isCheckBox ? style : {}}
          /*
           * Only what is specific to this component: room for the icon and the
           * end slot, and the checkbox, which base.css does not style. The ring,
           * placeholder, radius and type scale were a second copy of the element
           * style that had drifted to hardcoded grays — and being utilities, that
           * copy beat the one in `@layer base` everywhere it was used.
           */
          className={classNames(
            isCheckBox
              ? "mt-[-4px] cursor-pointer rounded-sm text-primary"
              : [InputIcon ? "pl-10" : "pl-3", endSlot ? "pr-11" : "pr-3"],
          )}
          // Screen readers announce the field as invalid, and read the message
          // that says why, instead of the user meeting it only by eye.
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        {endSlot && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            {endSlot}
          </div>
        )}
      </div>

      {error && !dense && (
        <p id={errorId} className="mt-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
};

export default Textfield;
