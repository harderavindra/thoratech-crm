import {
  forwardRef,
  type InputHTMLAttributes,
} from "react";

import clsx from "clsx";

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input =
  forwardRef<
    HTMLInputElement,
    InputProps
  >(
    (
      {
        className,
        error,
        ...props
      },
      ref
    ) => {
      return (
        <input
          ref={ref}
          className={clsx(
            "w-full rounded-lg border px-4 py-3 outline-none transition",

            error
              ? "border-red-500 focus:border-red-500"
              : "border-gray-300 focus:border-black",

            className
          )}
          {...props}
        />
      );
    }
  );

Input.displayName =
  "Input";