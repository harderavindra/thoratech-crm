import React from "react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type LogoSize = "sm" | "md" | "lg";
export type LogoVariant = "dark" | "light";

export interface LogoProps {
  /** Mark + wordmark scale */
  size?: LogoSize;
  /** Show or hide the "Magnific." wordmark */
  showWordmark?: boolean;
  /** Mark background: dark (black) or light (white with border) */
  variant?: LogoVariant;
  className?: string;
}

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const SIZE_MAP: Record<LogoSize, { mark: number; radius: number; icon: number; word: string }> = {
  sm: { mark: 24, radius: 6,  icon: 11, word: "text-[13px]" },
  md: { mark: 32, radius: 8,  icon: 15, word: "text-[15px]" },
  lg: { mark: 44, radius: 10, icon: 20, word: "text-[18px]" },
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  showWordmark = true,
  variant = "dark",
  className = "",
}) => {
  const { mark, radius, icon, word } = SIZE_MAP[size];

  const markBg =
    variant === "dark"
      ? "bg-gray-900"
      : "bg-white border border-gray-200";

  const iconColor = variant === "dark" ? "text-white" : "text-gray-900";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Mark */}
      <div
        className={`flex items-center justify-center shrink-0 ${markBg}`}
        style={{ width: mark, height: mark, borderRadius: radius }}
      >
        <span
          className={`font-bold leading-none ${iconColor}`}
          style={{ fontSize: icon }}
        >
          M
        </span>
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <span className={`font-semibold tracking-tight text-gray-900 dark:text-white ${word}`}>
          Magnific<span className="text-rose-500">.</span>
        </span>
      )}
    </div>
  );
};

export default Logo;