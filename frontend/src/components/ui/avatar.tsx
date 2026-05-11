import React from "react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type AvatarSize   = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarColor  = "rose" | "blue" | "amber" | "green" | "gray";
export type AvatarStatus = "online" | "away" | "offline";

export interface AvatarProps {
  /** 1–2 letter initials shown when no src */
  initials?: string;
  /** Image URL — takes priority over initials */
  src?: string;
  alt?: string;
  size?: AvatarSize;
  AvatarColor?: AvatarColor;
  /** Presence dot badge */
  status?: AvatarStatus;
  className?: string;
}

export interface AvatarGroupProps {
  avatars: Pick<AvatarProps, "initials" | "src" | "alt" | "AvatarColor">[];
  size?: AvatarSize;
  /** Max visible before "+N" overflow */
  max?: number;
  className?: string;
}

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const SIZE_MAP: Record<AvatarSize, { dim: string; text: string; iconSize: number; dot: string }> = {
  xs: { dim: "w-6 h-6",          text: "text-[9px]",  iconSize: 12, dot: "w-1.5 h-1.5" },
  sm: { dim: "w-8 h-8",          text: "text-[12px]", iconSize: 14, dot: "w-2 h-2"     },
  md: { dim: "w-10 h-10",        text: "text-[14px]", iconSize: 18, dot: "w-2.5 h-2.5" },
  lg: { dim: "w-[52px] h-[52px]",text: "text-[18px]", iconSize: 22, dot: "w-3 h-3"     },
  xl: { dim: "w-16 h-16",        text: "text-[22px]", iconSize: 28, dot: "w-3.5 h-3.5" },
};

const COLOR_MAP: Record<AvatarColor, { bg: string; text: string; ring: string }> = {
  rose:  { bg: "bg-rose-50",    text: "text-rose-500",    ring: "ring-1 ring-rose-200"    },
  blue:  { bg: "bg-blue-50",    text: "text-blue-600",    ring: "ring-1 ring-blue-200"    },
  amber: { bg: "bg-amber-50",   text: "text-amber-600",   ring: "ring-1 ring-amber-200"   },
  green: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-1 ring-emerald-200" },
  gray:  { bg: "bg-gray-100",   text: "text-gray-500",    ring: "ring-1 ring-gray-200"    },
};

const STATUS_DOT: Record<AvatarStatus, string> = {
  online:  "bg-emerald-400",
  away:    "bg-amber-400",
  offline: "bg-gray-300",
};

// ─────────────────────────────────────────────────────────────
// UserIcon (fallback)
// ─────────────────────────────────────────────────────────────

const UserIcon: React.FC<{ size: number; className?: string }> = ({ size, className = "" }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth={1.75}
    strokeLinecap="round" strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
  </svg>
);

// ─────────────────────────────────────────────────────────────
// Avatar
// ─────────────────────────────────────────────────────────────

export const Avatar: React.FC<AvatarProps> = ({
  initials,
  src,
  alt,
  size  = "md",
  AvatarColor = "rose",
  status,
  className = "",
}) => {
  const { dim, text, iconSize, dot } = SIZE_MAP[size];
  const { bg, text: textColor, ring }  = COLOR_MAP[AvatarColor] ?? COLOR_MAP.gray;

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div
        className={`${dim} ${bg} ${ring} rounded-full overflow-hidden flex items-center justify-center`}
        role="img"
        aria-label={alt ?? initials ?? "Avatar"}
      >
        {src ? (
          <img src={src} alt={alt ?? initials ?? ""} className="w-full h-full object-cover" />
        ) : initials ? (
          <span className={`${text} font-semibold ${textColor}`}>{initials}</span>
        ) : (
          <UserIcon size={iconSize} className={textColor} />
        )}
      </div>

      {status && (
        <span
          className={`absolute bottom-0 right-0 ${dot} ${STATUS_DOT[status]} rounded-full ring-2 ring-white`}
          aria-label={status}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// AvatarGroup
// ─────────────────────────────────────────────────────────────

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  size  = "sm",
  max   = 4,
  className = "",
}) => {
  const visible  = avatars.slice(0, max);
  const overflow = avatars.length - max;
  const { dim, text } = SIZE_MAP[size];

  return (
    <div className={`flex items-center ${className}`}>
      {visible.map((av, i) => (
        <div key={i} className="-ml-2 first:ml-0 ring-2 ring-white rounded-full">
          <Avatar {...av} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={`-ml-2 ${dim} rounded-full bg-gray-100 ring-2 ring-white flex items-center justify-center`}
          aria-label={`${overflow} more`}
        >
          <span className={`${text} font-semibold text-gray-500`}>+{overflow}</span>
        </div>
      )}
    </div>
  );
};

export default Avatar;