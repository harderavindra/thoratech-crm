import React, { forwardRef } from "react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type ButtonVariant = "primary" | "outline" | "secondary" | "ghost" | "danger";
export type ButtonSize    = "xs" | "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icon rendered before the label */
  iconLeft?: React.ReactNode;
  /** Icon rendered after the label */
  iconRight?: React.ReactNode;
  /** Renders a square icon-only button (no children rendered) */
  iconOnly?: boolean;
  /** Makes an iconOnly button fully circular */
  round?: boolean;
  /** Shows a spinner and disables interaction */
  loading?: boolean;
}

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const VARIANT_CLS: Record<ButtonVariant, string> = {
  primary:   "bg-gray-800 text-white border border-gray-900 hover:bg-gray-900 hover:border-gray-950",
  outline:   "bg-transparent text-gray-500 border border-gray-500 hover:bg-gray-50",
  secondary: "bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700",
  ghost:     "bg-transparent text-gray-700 border border-transparent hover:bg-gray-100 hover:border-gray-200 dark:text-gray-300 dark:hover:bg-gray-800",
  danger:    "bg-red-50 text-red-500 border border-red-100 hover:bg-red-100",
};

const SIZE_CLS: Record<ButtonSize, string> = {
  xs: "text-[11.5px] h-[26px] px-2.5 gap-1",
  sm: "text-[12.5px] h-[30px] px-3   gap-1.5",
  md: "text-[13.5px] h-9      px-4   gap-1.5",
  lg: "text-[14.5px] h-[42px] px-5   gap-2",
};

const ICON_ONLY_SIZE: Record<ButtonSize, string> = {
  xs: "w-[26px] h-[26px]",
  sm: "w-[30px] h-[30px]",
  md: "w-9      h-9",
  lg: "w-[42px] h-[42px]",
};

// ─────────────────────────────────────────────────────────────
// Spinner
// ─────────────────────────────────────────────────────────────

const Spinner: React.FC<{ light?: boolean }> = ({ light = false }) => (
  <svg
    className="animate-spin shrink-0"
    width={14} height={14} viewBox="0 0 24 24"
    fill="none" aria-hidden="true"
  >
    <circle
      cx={12} cy={12} r={10}
      stroke="currentColor"
      strokeOpacity={light ? 0.3 : 0.15}
      strokeWidth={3}
    />
    <path
      d="M12 2a10 10 0 0 1 10 10"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
    />
  </svg>
);

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant  = "secondary",
      size     = "md",
      iconLeft,
      iconRight,
      iconOnly = false,
      round    = false,
      loading  = false,
      disabled = false,
      children,
      className = "",
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const isLight    = variant === "primary";

    const baseClass = [
      "inline-flex items-center justify-center font-medium",
      "transition-all duration-150 active:scale-[0.97] whitespace-nowrap select-none",
      "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
      round ? "rounded-full" : "rounded-lg",
      VARIANT_CLS[variant],
      iconOnly ? `${ICON_ONLY_SIZE[size]} p-0` : SIZE_CLS[size],
      className,
    ].join(" ");

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={baseClass}
        aria-busy={loading ? true : undefined}
        {...rest}
      >
        {loading ? (
          <>
            <Spinner light={isLight} />
            {!iconOnly && <span>{children}</span>}
          </>
        ) : (
          <>
            {iconLeft  && <span className="flex items-center" aria-hidden="true">{iconLeft}</span>}
            {iconOnly  ? <span className="flex items-center" aria-hidden="true">{children}</span>
                       : <span>{children}</span>}
            {iconRight && <span className="flex items-center" aria-hidden="true">{iconRight}</span>}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;