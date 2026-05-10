import type {
  ButtonHTMLAttributes,
} from "react";

import clsx from "clsx";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export const Button = ({
  children,
  className,
  loading,
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <button
      disabled={
        disabled || loading
      }
      className={clsx(
        "w-full rounded-full bg-black px-4 py-3 font-medium text-white transition",

        "hover:opacity-90",

        "disabled:cursor-not-allowed disabled:opacity-50",

        className
      )}
      {...props}
    >
      {loading
        ? "Loading..."
        : children}
    </button>
  );
};