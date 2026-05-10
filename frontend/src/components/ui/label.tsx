import type {
  LabelHTMLAttributes,
} from "react";

import clsx from "clsx";

interface LabelProps
  extends LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = ({
  children,
  className,
  ...props
}: LabelProps) => {
  return (
    <label
      className={clsx(
        "mb-1 block text-sm font-medium text-gray-700",
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
};