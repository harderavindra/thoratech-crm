import { useState } from "react";
import {
  Mail, Phone, UserCog, UserRoundCheck,
  X, Calendar, Clock, Trash2, ToggleLeft, ToggleRight,
} from "lucide-react";
import { Button } from "./ui/button";
import Avatar from "./ui/avatar";
import { ConfirmDialog } from "./confirmation-dialog";
import { useUserById, useUpdateUser, useDeleteUser } from "../modules/users/hooks/use-users";
import { useAuthStore } from "../modules/auth/store/auth.store";
import type { ApiUser, UserStatus } from "../types/user.types";
import type { AvatarColor } from "./ui/avatar";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const toTitleCase = (str: string) =>
  str.toLowerCase().split(/[_\s-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

const getInitials = (name: string) =>
  name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "").join("") || "?";

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

const formatDateTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

const MetaRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
    <span className="mt-0.5 text-gray-400 shrink-0">{icon}</span>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] text-gray-400 m-0 mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 m-0 break-all">{value}</p>
    </div>
  </div>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mt-6 mb-2">
    {children}
  </p>
);

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type ConfirmAction = "activate" | "deactivate" | "delete" | null;

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

interface UserViewPanelProps {
  listUser: ApiUser;
  onClose:    () => void;
  onEdit:     () => void;
  onRefresh?: () => void;
  onDeleted?: () => void;
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

const AVATAR_COLOR: AvatarColor = "blue";

export const UserViewPanel = ({ listUser, onClose, onEdit, onRefresh, onDeleted }: UserViewPanelProps) => {
  const { data, isLoading }  = useUserById(listUser._id);
  const user: ApiUser        = data?.data?.user ?? listUser;
  const updateUser           = useUpdateUser();
  const deleteUser           = useDeleteUser();

  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const currentUser = useAuthStore((s) => s.user);
  const actorRole   = currentUser?.role;
  const actorId     = currentUser?.id;

  const isLocked     = !!user.lockoutUntil && new Date(user.lockoutUntil) > new Date();
  const isActive     = user.status === "active";
  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const isPending    = updateUser.isPending || deleteUser.isPending;

  const canEdit         = actorRole === "SUPER_ADMIN" || actorRole === "ADMIN";
  const canDelete       = !isSuperAdmin && (
    actorRole === "SUPER_ADMIN" || (actorRole === "ADMIN" && !!user.createdBy && String(user.createdBy) === actorId) ||
    (actorRole === "TEAM_LEAD" && !!user.createdBy && String(user.createdBy) === actorId)
  );
  const canToggleStatus = !isSuperAdmin && (
    actorRole === "SUPER_ADMIN" || (actorRole === "ADMIN" && !!user.createdBy && String(user.createdBy) === actorId) ||
    (actorRole === "TEAM_LEAD" && !!user.createdBy && String(user.createdBy) === actorId)
  );

  const handleConfirm = () => {
    if (!confirmAction) return;

    if (confirmAction === "delete") {
      deleteUser.mutate(user._id, {
        onSuccess: () => {
          setConfirmAction(null);
          onDeleted?.();
          onClose();
        },
      });
      return;
    }

    const newStatus: UserStatus = confirmAction === "activate" ? "active" : "inactive";
    updateUser.mutate(
      { id: user._id, payload: { status: newStatus } },
      {
        onSuccess: () => {
          setConfirmAction(null);
          onRefresh?.();           // ← refetch list immediately
        },
      },
    );
  };

  return (
    <div className="relative h-full w-full rounded-2xl bg-white p-8 overflow-y-auto">

      {/* ── Close ── */}
      <Button
        iconOnly iconLeft={<X size={16} />}
        size="sm" variant="primary"
        onClick={onClose}
        className="absolute right-5 top-5"
        aria-label="Close"
      />

      {/* ── Avatar + name ── */}
      <div className="flex items-center gap-4 mb-6">
        <Avatar size="xl" initials={getInitials(user.fullName)} AvatarColor={AVATAR_COLOR} />
        <div>
          <p className="text-2xl font-bold m-0">{user.fullName}</p>
          {user.username && <p className="text-sm text-gray-400 m-0">@{user.username}</p>}
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-gray-300"}`} />
              {toTitleCase(user.status)}
            </span>
            <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
              {toTitleCase(user.role)}
            </span>
            {isLocked && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                Locked
              </span>
            )}
            {isLoading && <span className="text-[11px] text-gray-400 animate-pulse">Loading…</span>}
          </div>
        </div>
      </div>

      {/* ── Contact ── */}
      <SectionLabel>Contact</SectionLabel>
      <MetaRow icon={<Mail size={15} />} label="Email" value={<a href={`mailto:${user.email}`} className="text-blue-600 hover:underline">{user.email}</a>} />
      <MetaRow icon={<Phone size={15} />} label="Phone" value={user.phone || "—"} />

      {/* ── Role & access ── */}
      <SectionLabel>Role & access</SectionLabel>
      <MetaRow icon={<UserCog size={15} />} label="Role" value={toTitleCase(user.role)} />
      <MetaRow icon={<UserRoundCheck size={15} />} label="Status" value={toTitleCase(user.status)} />

      {/* ── Activity ── */}
      <SectionLabel>Activity</SectionLabel>
      <MetaRow icon={<Calendar size={15} />} label="Joined" value={formatDate(user.createdAt)} />
      {user.lastLogin && <MetaRow icon={<Clock size={15} />} label="Last login" value={formatDateTime(user.lastLogin)} />}
      {typeof user.loginAttempts === "number" && user.loginAttempts > 0 && (
        <MetaRow icon={<UserRoundCheck size={15} />} label="Failed login attempts" value={<span className="text-red-500 font-medium">{user.loginAttempts}</span>} />
      )}
      {isLocked && user.lockoutUntil && (
        <MetaRow icon={<Clock size={15} />} label="Locked until" value={<span className="text-red-500">{formatDateTime(user.lockoutUntil)}</span>} />
      )}

      {/* ── Edit action ── */}
      {canEdit && (
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" onClick={onEdit}>Edit User</Button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          Status section
      ════════════════════════════════════════════════════════ */}
      {canToggleStatus && (
        <>
          <SectionLabel>{isActive ? "Deactivate User" : "Activate User"}</SectionLabel>

          <div className={`rounded-xl border overflow-hidden ${isActive ? "border-amber-200" : "border-emerald-200"}`}>
            <div className="p-5">
              <p className="text-base font-semibold text-gray-900 m-0 mb-1">
                {isActive ? "Deactivate User" : "Activate User"}
              </p>
              <p className="text-sm text-gray-500 m-0">
                {isActive
                  ? "Suspends this user's access. They will not be able to log in until reactivated."
                  : "Restores this user's access. They will be able to log in immediately."}
              </p>
            </div>
            <div className={`flex items-center justify-between px-5 py-3 border-t ${isActive ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}`}>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {isActive ? <ToggleRight size={16} className="text-amber-500" /> : <ToggleLeft size={16} className="text-emerald-500" />}
                <span>Currently <strong>{toTitleCase(user.status)}</strong></span>
              </div>
              <button
                onClick={() => setConfirmAction(confirmAction === (isActive ? "deactivate" : "activate") ? null : (isActive ? "deactivate" : "activate"))}
                className={`inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-lg border transition-colors cursor-pointer ${
                  isActive
                    ? "bg-amber-500 hover:bg-amber-600 text-white border-transparent"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
                }`}
              >
                {isActive ? "Deactivate User" : "Activate User"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════
          Delete section
      ════════════════════════════════════════════════════════ */}
      {canDelete && (
        <>
          <SectionLabel>Delete User</SectionLabel>

          <div className="rounded-xl border border-red-200 overflow-hidden">
            <div className="p-5">
              <p className="text-base font-semibold text-gray-900 m-0 mb-1">Delete User</p>
              <p className="text-sm text-gray-500 m-0">
                Permanently delete this user and all associated data, sessions, and activity logs.
                This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 px-5 py-3 bg-red-50 border-t border-red-200">
              <button
                onClick={() => setConfirmAction("delete")}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white border-transparent border cursor-pointer transition-colors"
              >
                <Trash2 size={14} />
                Delete User
              </button>
            </div>
          </div>
        </>
      )}

      <div className="h-8" />

      {/* ── Confirm dialogs — portals rendered above all content ── */}
      <ConfirmDialog
        open={confirmAction === "deactivate"}
        variant="warning"
        title="Deactivate User"
        description="This will suspend the user's access. They will not be able to log in until reactivated."
        keyword="inactive"
        confirmLabel="Deactivate User"
        previewName={user.fullName}
        previewInitials={getInitials(user.fullName)}
        isPending={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmDialog
        open={confirmAction === "activate"}
        variant="success"
        title="Activate User"
        description="This will restore the user's access. They will be able to log in immediately."
        keyword="active"
        confirmLabel="Activate User"
        previewName={user.fullName}
        previewInitials={getInitials(user.fullName)}
        isPending={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmDialog
        open={confirmAction === "delete"}
        variant="danger"
        title="Delete User"
        description="Permanently delete this user and all associated data, sessions, and activity logs. This action cannot be undone."
        keyword="delete"
        confirmLabel="Delete User"
        previewName={user.fullName}
        previewInitials={getInitials(user.fullName)}
        isPending={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
};