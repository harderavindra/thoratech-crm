import { useState } from "react";
import {
  Headphones, Plus, ShieldCheck, User, UserCog,
  BadgeCheck, ChevronLeft, ChevronRight, UserRoundCheck,
} from "lucide-react";

import { AddUserForm } from "../../../components/add-user-form";
import { useUsers } from "../hooks/use-users";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { CompactCard } from "../../../components/user-card";
import { useAuthStore } from "../../auth/store/auth.store";


// ← single source of truth for all user types
import type { ApiUser, UserRole, UserStatus } from "../../../types/user.types";
import { UserViewPanel } from "../../../components/user-viewpanel";

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

type Modal = "add" | "edit" | "view" | null;

const toTitleCase = (str: string) =>
  str.toLowerCase().split(/[_\s-]+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const ROLES: { value: UserRole; icon: React.ReactNode }[] = [
  { value: "SUPER_ADMIN", icon: <ShieldCheck size={18} /> },
  { value: "ADMIN",       icon: <UserCog    size={18} /> },
  { value: "TEAM_LEAD",   icon: <User       size={18} /> },
  { value: "AGENT",       icon: <Headphones size={18} /> },
  { value: "QA",          icon: <BadgeCheck size={18} /> },
];

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export const UsersPage = () => {
  const [page,   setPage]   = useState(1);
  const [search, setSearch] = useState("");
  const [role,   setRole]   = useState<UserRole | "">("");
  const [status, setStatus] = useState<UserStatus | "">("");

  const [refreshKey, setRefreshKey] = useState(0);

  const currentUser = useAuthStore((s) => s.user);
  const actorRole   = currentUser?.role;
  const canCreate   = actorRole === "SUPER_ADMIN" || actorRole === "ADMIN" || actorRole === "TEAM_LEAD";
  const canEdit     = actorRole === "SUPER_ADMIN" || actorRole === "ADMIN";

  const [modal,        setModal]        = useState<Modal>(null);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);

  const { data, isLoading ,refetch} = useUsers({ page, limit: 10, search, role, status ,refreshKey});

  const users: ApiUser[] = data?.data?.users      ?? [];
  const pagination       = data?.data?.pagination;

  // ── Helpers ───────────────────────────────────────────────

  const findUser = (id: string) => users.find((u) => u._id === id) ?? null;

  const openAdd = () => {
    setSelectedUser(null);
    setModal("add");
  };

  const openView = (id: string) => {
    const user = findUser(id);
    if (!user) return;
    setSelectedUser(user);
    setModal("view");
  };

  const openEdit = (id: string) => {
    const user = findUser(id);
    if (!user) return;
    setSelectedUser(user);
    setModal("edit");
  };

  const closeModal = () => {
    setModal(null);
    setSelectedUser(null);
  };

  const toggleRole = (r: UserRole) => {
    setPage(1);
    setRole((prev) => (prev === r ? "" : r));
  };

  const toggleStatus = (s: UserStatus) => {
    setPage(1);
    setStatus((prev) => (prev === s ? "" : s));
  };

  const formattedUsers = users.map((u) => ({
    id:          u._id,
    name:        u.fullName,
    role:        u.role,
    initials:    getInitials(u.fullName),
    status:      u.status as "active" | "away" | "offline",
    avatarColor: "blue" as const,
  }));
const handleRefresh = () => setRefreshKey((k) => k + 1);

  // ─────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col flex-1">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users</h1>
        {canCreate && (
          <Button iconOnly variant="primary" onClick={openAdd} aria-label="Add user">
            <Plus />
          </Button>
        )}
      </div>

      <div className="flex gap-1 flex-1">

        {/* ── Sidebar filters ── */}
        <div className="flex flex-col gap-4 rounded-xl bg-white p-4">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          />

          <label className="block text-sm text-gray-400">Role</label>
          <div className="flex flex-col items-center gap-2">
            {ROLES.map((r) => (
              <Button
                key={r.value}
                className="w-full items-center justify-start text-left"
                variant={role === r.value ? "secondary" : "ghost"}
                iconLeft={r.icon}
                onClick={() => toggleRole(r.value)}
              >
                <span className="ml-2">{toTitleCase(r.value)}</span>
              </Button>
            ))}
          </div>

          <label className="block text-sm text-gray-400">Status</label>
          <Button
            className="w-full items-center justify-start text-left"
            variant={status === "active" ? "secondary" : "ghost"}
            iconLeft={<UserRoundCheck size={18} />}
            onClick={() => toggleStatus("active")}
          >
            <span className="ml-2">Active</span>
          </Button>
          <Button
            className="w-full items-center justify-start text-left"
            variant={status === "inactive" ? "secondary" : "ghost"}
            iconLeft={<UserRoundCheck size={18} />}
            onClick={() => toggleStatus("inactive")}
          >
            <span className="ml-2">Inactive</span>
          </Button>
        </div>

        {/* ── User list ── */}
        <div className="min-w-xs overflow-hidden rounded-2xl bg-white">
          {isLoading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <p className="px-4 py-6 text-center text-gray-400">Loading...</p>
            </div>
          ) : (
            <CompactCard
              title="Team members"
              users={formattedUsers}
              onView={openView}
              onEdit={canEdit ? openEdit : undefined}
            />
          )}

          {pagination && (
            <div className="mt-5 flex items-center justify-between px-5">
              <p className="text-xs text-gray-400">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm" variant="secondary" iconOnly
                  iconLeft={<ChevronLeft size={12} />}
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                />
                <Button
                  size="sm" variant="secondary" iconOnly
                  iconLeft={<ChevronRight size={12} />}
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Right panel ── */}
        <div className="w-full">
          {modal === "add" && (
            <AddUserForm mode="add" onClose={closeModal} />
          )}

          {modal === "edit" && selectedUser && (
            <AddUserForm mode="edit" user={selectedUser} onClose={closeModal} />
          )}
 {modal === "view" && selectedUser && (
            <UserViewPanel
              listUser={selectedUser}
              onClose={closeModal}
              onEdit={handleRefresh}
               onRefresh={handleRefresh}
              onDeleted={handleRefresh}
            />
          )}
      
        </div>

      </div>
    </div>
  );
};