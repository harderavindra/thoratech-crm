import {
  forwardRef,
  useState,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type InputSize = "sm" | "md" | "lg";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Renders a label above the input */
  label?: string;
  /** String → shows inline error message + red state. Boolean → red state only. */
  error?: string | boolean;
  /** Subtle helper text shown below (hidden when error is present) */
  helperText?: string;
  /** Icon/node rendered inside the left edge */
  leftIcon?: ReactNode;
  /** Icon/node rendered inside the right edge (ignored for password type) */
  rightIcon?: ReactNode;
  size?: InputSize;
}

// ─────────────────────────────────────────────────────────────
// Size tokens
// ─────────────────────────────────────────────────────────────

const INPUT_PAD: Record<InputSize, string> = {
  sm: "px-3 py-1.5 text-[13px]",
  md: "px-4 py-2.5 text-sm",
  lg: "px-4 py-3   text-base",
};

const ICON_WIDTH: Record<InputSize, string> = {
  sm: "w-8",
  md: "w-10",
  lg: "w-11",
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      size = "md",
      type,
      required,
      id,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const generatedId = useId();
    const inputId = id ?? generatedId;

    const isPassword    = type === "password";
    const hasError      = !!error;
    const errorMessage  = typeof error === "string" ? error : undefined;
    const hasRightSlot  = isPassword || !!rightIcon;

    const iconBase = clsx(
      "absolute inset-y-0 flex items-center justify-center",
      ICON_WIDTH[size],
    );

    const field = (
      <div className="relative">

        {/* Left icon */}
        {leftIcon && (
          <span className={clsx(iconBase, "left-0 text-gray-400 pointer-events-none")}>
            {leftIcon}
          </span>
        )}

        {/* Input */}
        <input
          ref={ref}
          id={inputId}
          type={isPassword && showPassword ? "text" : type}
          disabled={disabled}
          required={required}
          aria-invalid={hasError || undefined}
          aria-describedby={
            errorMessage   ? `${inputId}-error`
            : helperText   ? `${inputId}-helper`
            : undefined
          }
          className={clsx(
            "w-full rounded-lg border outline-none transition-all duration-150",
            INPUT_PAD[size],
            leftIcon    && "pl-10",
            hasRightSlot && "pr-10",

            // State: error
            hasError && [
              "border-red-400 bg-red-50/40 placeholder-red-300",
              "focus:border-red-500 focus:ring-2 focus:ring-red-100",
            ],

            // State: normal
            !hasError && [
              "border-gray-200 bg-white placeholder-gray-400",
              "hover:border-gray-300",
              "focus:border-gray-800 focus:ring-2 focus:ring-gray-100",
            ],

            // State: disabled
            disabled && "cursor-not-allowed opacity-50 bg-gray-50 select-none",

            className,
          )}
          {...props}
        />

        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            onClick={() => setShowPassword((v) => !v)}
            className={clsx(
              iconBase, "right-0",
              "text-gray-400 hover:text-gray-600 transition-colors",
            )}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}

        {/* Right icon (not shown for password — toggle takes that slot) */}
        {!isPassword && rightIcon && (
          <span className={clsx(iconBase, "right-0 text-gray-400 pointer-events-none")}>
            {rightIcon}
          </span>
        )}

      </div>
    );

    // No label / message — return the bare field (backward-compatible)
    if (!label && !errorMessage && !helperText) return field;

    return (
      <div className="flex flex-col gap-1">

        {label && (
          <label
            htmlFor={inputId}
            className="text-[11px] font-light text-gray-400 select-none"
          >
            {label}
            {required && (
              <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>
            )}
          </label>
        )}

        {field}

        {errorMessage ? (
          <p id={`${inputId}-error`} role="alert" className="text-[12px] text-red-500 leading-snug">
            {errorMessage}
          </p>
        ) : helperText ? (
          <p id={`${inputId}-helper`} className="text-[12px] text-gray-400 leading-snug">
            {helperText}
          </p>
        ) : null}

      </div>
    );
  },
);

Input.displayName = "Input";
