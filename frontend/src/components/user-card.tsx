import React from "react";
import Button from "./ui/button";
import { Archive, Edit, Lock } from "lucide-react";
import type { AvatarColor } from "./ui/avatar";

export type { AvatarColor };

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type UserStatus  = "active" | "away" | "offline" | "inactive";
export type UserRole    = "admin" | "member" | "guest" | (string & {});
export type CardVariant = "default" | "stats" | "compact" | "detailed";

export interface UserStat {
  label: string;
  value: string | number;
}

export interface UserCardUser {
  id: string;
  name: string;
  role: string;
  initials: string;
  email?: string;
  phone?: string;
  company?: string;
  location?: string;
  joinedAt?: string;
  status?: UserStatus;
  userRole?: UserRole;
  stats?: [UserStat, UserStat, UserStat];
  avatarColor?: AvatarColor;
  isLocked?: boolean;
  isArchived?: boolean;
}

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const AVATAR_COLORS: Record<AvatarColor, { bg: string; text: string }> = {
  rose:   { bg: "bg-rose-800",    text: "text-rose-50"    },
  blue:   { bg: "bg-blue-800",    text: "text-blue-50"    },
  purple: { bg: "bg-violet-600",  text: "text-violet-50"  },
  teal:   { bg: "bg-teal-600",    text: "text-teal-50"    },
  green:  { bg: "bg-emerald-600", text: "text-emerald-50" },
  amber:  { bg: "bg-amber-600",   text: "text-amber-50"   },
  coral:  { bg: "bg-orange-600",  text: "text-orange-50"  },
  gray:   { bg: "bg-gray-400",    text: "text-gray-50"    },
};

const STATUS_STYLES: Record<UserStatus, { badge: string; dot: string; label: string }> = {
  active:   { badge: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-400", label: "Active"   },
  away:     { badge: "bg-amber-50   text-amber-700",   dot: "bg-amber-400",   label: "Away"     },
  offline:  { badge: "bg-gray-100   text-gray-500",    dot: "bg-gray-300",    label: "Offline"  },
  inactive: { badge: "bg-gray-100   text-gray-500",    dot: "bg-gray-300",    label: "Inactive" },
};

const ROLE_BADGE: Record<UserRole, string> = {
  admin:  "bg-amber-50  text-amber-700",
  member: "bg-blue-50   text-blue-700",
  guest:  "bg-gray-100  text-gray-500",
};

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

const Avatar: React.FC<{ initials: string; color?: AvatarColor; size?: "sm" | "md" | "lg" }> = ({
  initials,
  color = "rose",
  size  = "md",
}) => {
  const { bg, text } = AVATAR_COLORS[color];
  const dim = { sm: "w-8 h-8 text-xs", md: "w-11 h-11 text-sm", lg: "w-14 h-14 text-lg" }[size];
  return (
    <div className={`${dim} ${bg} ${text} rounded-full flex items-center justify-center font-medium shrink-0`}>
      {initials}
    </div>
  );
};

const StatusBadge: React.FC<{ status: UserStatus }> = ({ status }) => {
  const { badge, dot, label } = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
};

const ActionButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "primary"; icon?: string }
> = ({ variant = "default", icon, children, className = "", ...rest }) => (
  <button
    className={[
      "flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 text-[13px] rounded-lg",
      "border transition-colors duration-150 cursor-pointer",
      variant === "primary"
        ? "bg-rose-500 text-white border-rose-500 hover:bg-rose-600"
        : "bg-transparent text-gray-700 border-gray-200 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800",
      className,
    ].join(" ")}
    {...rest}
  >
    {icon && <i className={`ti ${icon} text-[15px]`} aria-hidden="true" />}
    {children}
  </button>
);

const MetaRow: React.FC<{ icon: string; children: React.ReactNode }> = ({ icon, children }) => (
  <div className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400 mb-2 last:mb-0">
    <i className={`ti ${icon} text-[15px] text-gray-400 dark:text-gray-500 shrink-0`} aria-hidden="true" />
    {children}
  </div>
);

const Divider = () => <hr className="border-gray-100 dark:border-gray-800 my-3" />;

// ─────────────────────────────────────────────────────────────
// Variants
// ─────────────────────────────────────────────────────────────

const DefaultCard: React.FC<{ user: UserCardUser }> = ({ user }) => (
  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5">
    <div className="flex flex-col items-center text-center gap-2.5">
      <Avatar initials={user.initials} color={user.avatarColor} size="lg" />
      <div>
        <p className="text-[15px] font-medium text-gray-900 dark:text-gray-100 m-0">{user.name}</p>
        <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5 m-0">{user.role}</p>
      </div>
      {user.status && <StatusBadge status={user.status} />}
    </div>
    <Divider />
    <div className="flex gap-2">
      <ActionButton icon="ti-mail">Message</ActionButton>
      <ActionButton variant="primary" icon="ti-user-plus">Follow</ActionButton>
    </div>
  </div>
);

const StatsCard: React.FC<{ user: UserCardUser }> = ({ user }) => {
  const stats = user.stats ?? [
    { label: "Tasks",  value: 0    },
    { label: "Done",   value: "0%" },
    { label: "Rating", value: 0    },
  ];
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-3.5">
        <Avatar initials={user.initials} color={user.avatarColor} size="md" />
        <div className="min-w-0">
          <p className="text-[14px] font-medium text-gray-900 dark:text-gray-100 m-0 truncate">{user.name}</p>
          <p className="text-[12px] text-gray-500 dark:text-gray-400 m-0">{user.role}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-800 rounded-lg py-2.5 px-1">
        {stats.map((s, i) => (
          <div key={i} className={`text-center ${i > 0 ? "border-l border-gray-200 dark:border-gray-700" : ""}`}>
            <p className="text-[18px] font-medium text-gray-900 dark:text-gray-100 m-0">{s.value}</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 m-0">{s.label}</p>
          </div>
        ))}
      </div>
      <Divider />
      <div className="flex items-center justify-between">
        {user.location && (
          <span className="text-[12px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
            <i className="ti ti-map-pin text-[13px]" aria-hidden="true" /> {user.location}
          </span>
        )}
        {user.userRole && (
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${ROLE_BADGE[user.userRole]}`}>
            {user.userRole === "admin" && <i className="ti ti-crown text-[11px] mr-0.5" aria-hidden="true" />}
            {user.userRole.charAt(0).toUpperCase() + user.userRole.slice(1)}
          </span>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// CompactRow — fix: onEdit comes in as a prop, not a free variable
// ─────────────────────────────────────────────────────────────

interface CompactRowProps {
  user: UserCardUser;
  onEdit?: (userId: string) => void;
  onView?: (userId: string) => void;
}

const CompactRow: React.FC<CompactRowProps> = ({ user, onEdit, onView }) => (
  <div
    className={`relative flex items-center gap-2.5 py-1.5 px-2 border last:border-0 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition-colors ${user.isLocked ? "border-red-300 bg-red-50" : user.isArchived ? "border-orange-200 bg-orange-50" : "border-gray-100 dark:border-gray-800"}`}
    onClick={() => onView?.(user.id)}
    role={onView ? "button" : undefined}
    tabIndex={onView ? 0 : undefined}
    onKeyDown={(e) => e.key === "Enter" && onView?.(user.id)}
  >
    {user.isLocked && (
      <span className="absolute -top-2 -right-2 w-4 h-4 flex items-center justify-center rounded-full bg-red-500 text-white">
        <Lock size={9} />
      </span>
    )}
    {user.isArchived && (
      <span className="absolute -top-2 -right-2 w-4 h-4 flex items-center justify-center rounded-full bg-orange-400 text-white">
        <Archive size={9} />
      </span>
    )}
    <Avatar initials={user.initials} color={user.avatarColor} size="sm" />
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-medium text-gray-900 dark:text-gray-100 m-0 truncate">{user.name}</p>
      <p className="text-[11px] text-gray-400 dark:text-gray-500 m-0">{user.role}</p>
    </div>
    {user.isArchived
      ? <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-orange-50 text-orange-600">Archived</span>
      : user.status && <StatusBadge status={user.status} />
    }
    {onEdit && (
      <Button
        variant="secondary"
        iconOnly
        iconLeft={<Edit size={12} />}
        size="xs"
        className="flex-shrink-0"
        aria-label={`Edit ${user.name}`}
        onClick={(e) => {
          e.stopPropagation();
          onEdit(user.id);
        }}
      />
    )}
  </div>
);

export interface CompactCardProps {
  users: UserCardUser[];
  title?: string;
  onEdit?: (userId: string) => void;
  onView?: (userId: string) => void;
}

export const CompactCard: React.FC<CompactCardProps> = ({
  users,
  title = "",
  onEdit,
  onView,
}) => (
  <div className="flex flex-col gap-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3">
    {/* <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-gray-400 dark:text-gray-500 m-0 mb-2.5">
      {title}
    </p> */}
    {users.map((u) => (
      <CompactRow key={u.id} user={u} onEdit={onEdit} onView={onView} />
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────
// DetailedCard
// ─────────────────────────────────────────────────────────────

const DetailedCard: React.FC<{ user: UserCardUser; onViewProfile?: () => void }> = ({
  user,
  onViewProfile,
}) => (
  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2.5">
        <Avatar initials={user.initials} color={user.avatarColor} size="md" />
        <div>
          <p className="text-[14px] font-medium text-gray-900 dark:text-gray-100 m-0">{user.name}</p>
          <p className="text-[12px] text-gray-500 dark:text-gray-400 m-0">{user.role}</p>
        </div>
      </div>
      <button
        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-0.5 bg-transparent border-none cursor-pointer"
        aria-label="More options"
      >
        <i className="ti ti-dots text-[18px]" aria-hidden="true" />
      </button>
    </div>

    {user.email    && <MetaRow icon="ti-mail">{user.email}</MetaRow>}
    {user.phone    && <MetaRow icon="ti-phone">{user.phone}</MetaRow>}
    {user.company  && <MetaRow icon="ti-building">{user.company}</MetaRow>}
    {user.joinedAt && <MetaRow icon="ti-calendar">Joined {user.joinedAt}</MetaRow>}

    <Divider />
    <div className="flex gap-2">
      {user.email && <ActionButton icon="ti-mail"  className="flex-none w-9 px-0" aria-label="Send email" />}
      {user.phone && <ActionButton icon="ti-phone" className="flex-none w-9 px-0" aria-label="Call" />}
      <ActionButton icon="ti-calendar" className="flex-none w-9 px-0" aria-label="Schedule" />
      <ActionButton variant="primary" icon="ti-eye" className="flex-[2]" onClick={onViewProfile}>
        View profile
      </ActionButton>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Main export — UserCard
// ─────────────────────────────────────────────────────────────

export interface UserCardProps {
  user: UserCardUser;
  variant?: Exclude<CardVariant, "compact">;
  onViewProfile?: () => void;
  onMessage?: () => void;
  onFollow?: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  variant = "default",
  onViewProfile,
}) => {
  switch (variant) {
    case "stats":    return <StatsCard    user={user} />;
    case "detailed": return <DetailedCard user={user} onViewProfile={onViewProfile} />;
    default:         return <DefaultCard  user={user} />;
  }
};

export default UserCard;