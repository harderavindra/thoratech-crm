import { useState } from "react";
import {
  Headphones, Plus, ShieldCheck, User, UserCog,
  BadgeCheck, ChevronLeft, ChevronRight, UserRoundCheck, Archive, X, Users, Search,
} from "lucide-react";

import { AddUserForm } from "../../../components/add-user-form";
import { useUsers } from "../hooks/use-users";
import { Button } from "../../../components/ui/button";
import { SearchInput } from "../../../components/ui/search";
import { CompactCard } from "../../../components/user-card";
import { useAuthStore } from "../../auth/store/auth.store";
import { PageHeader } from "../../../components/ui/page-header";
import { PageLoader, Spinner } from "../../../components/ui/loader";
import { Alert } from "../../../components/ui/alert";



// ← single source of truth for all user types
import type { ApiUser, UserRole, UserStatus } from "../../../types/user.types";
import { UserViewPanel } from "../../../components/user-viewpanel";
import { EmptyState } from "../../../components/ui/empty-state";
import { getInitials } from "../../../utils/get-initials";
import { toTitleCase } from "../../../utils/to-title-case"
import { avatarColorFromId } from "../../../utils/avatar-color"
// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

type Modal = "add" | "edit" | "view" | null;





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
  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState("");
  const [role,     setRole]     = useState<UserRole | "">("");
  const [status,   setStatus]   = useState<UserStatus | "">("");
  const [archived, setArchived] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  const currentUser    = useAuthStore((s) => s.user);
  const actorRole      = currentUser?.role;
  const canCreate      = actorRole === "SUPER_ADMIN" || actorRole === "ADMIN" || actorRole === "TEAM_LEAD";
  const canEdit        = actorRole === "SUPER_ADMIN" || actorRole === "ADMIN";
  const canViewArchived = actorRole === "SUPER_ADMIN" || actorRole === "ADMIN" || actorRole === "TEAM_LEAD";

  const [modal,        setModal]        = useState<Modal>(null);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);

  const { data, isLoading, isFetching, isError } = useUsers({ page, limit: 10, search, role, status, archived, refreshKey });

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
    setArchived(false);
    closeModal();
    if (role === r) {
      setRole("");
      setStatus("");
    } else {
      setRole(r);
      setStatus("active");
    }
  };

  const toggleStatus = (s: UserStatus) => {
    setPage(1);
    setRole("");
    setArchived(false);
    closeModal();
    setStatus((prev) => (prev === s ? "" : s));
  };

  const toggleArchived = () => {
    setPage(1);
    setRole("");
    setStatus("");
    closeModal();
    setArchived((prev) => !prev);
  };

  const clearAll = () => {
    setPage(1);
    setRole("");
    setStatus("");
    setArchived(false);
    closeModal();
  };

  const hasActiveFilters = role !== "" || status !== "" || archived;

  const formattedUsers = users.map((u) => ({
    id:         u._id,
    name:       toTitleCase(u.fullName),
    role:       toTitleCase(u.role),
    initials:   getInitials(u.fullName),
    status:     u.status as "active" | "away" | "offline",
    isLocked:   !!u.lockoutUntil && new Date(u.lockoutUntil) > new Date(),
    isArchived: !!u.deletedAt,
    avatarColor: avatarColorFromId(u._id),
  }));

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  // ── Context-aware empty state ─────────────────────────────
  const emptyState = (() => {
    if (archived) return {
      icon: <Archive size={40} />,
      color: "text-orange-300",
      title: "Nothing in the archive",
      subtitle: "Deleted users will appear here",
    };
    if (status === "inactive") return {
      icon: <UserRoundCheck size={40} />,
      color: "text-emerald-300",
      title: "Everyone's active!",
      subtitle: "No inactive users on the team right now",
    };
    if (role && search) return {
      icon: <Search size={40} />,
      color: "text-gray-300",
      title: `No ${toTitleCase(role)} matching "${search}"`,
      subtitle: "Try a different name or email",
    };
    if (role) return {
      icon: ({ SUPER_ADMIN: <ShieldCheck size={40} />, ADMIN: <UserCog size={40} />, TEAM_LEAD: <User size={40} />, AGENT: <Headphones size={40} />, QA: <BadgeCheck size={40} /> } as Record<string, React.ReactNode>)[role] ?? <Users size={40} />,
      color: "text-blue-200",
      title: `No ${toTitleCase(role)} yet`,
      subtitle: "No one with this role has been added yet",
    };
    if (search) return {
      icon: <Search size={40} />,
      color: "text-gray-300",
      title: `Nothing for "${search}"`,
      subtitle: "Check the spelling or try a different name",
    };
    return {
      icon: <Users size={40} />,
      color: "text-blue-200",
      title: "No team members yet",
      subtitle: "Hit + to add your first user",
    };
  })();

  // ─────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col flex-1">

      <PageHeader
        title="Users"
        action={
          canCreate && !archived ? (
            <Button iconOnly variant="primary" onClick={openAdd} aria-label="Add user">
              <Plus />
            </Button>
          ) : undefined
        }
      />

      <div className="flex gap-1 flex-1">

        {/* ── Sidebar filters ── */}
        <div className="flex flex-col gap-4 rounded-xl bg-white p-4 w-md">

          <label className="block text-sm text-gray-400">Role</label>
          <div className="flex flex-col items-center gap-2">
            <Button
              className="w-full items-center justify-start text-left"
              variant={role === "" ? "secondary" : "ghost"}
              iconLeft={<Users size={18} />}
              onClick={() => { setPage(1); setRole(""); setStatus(""); closeModal(); }}
            >
              <span className="ml-2">All</span>
            </Button>
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
            variant={status === "inactive" ? "secondary" : "ghost"}
            iconLeft={<UserRoundCheck size={18} />}
            onClick={() => toggleStatus("inactive")}
          >
            <span className="ml-2">Inactive</span>
          </Button>

          {canViewArchived && (
            <Button
              className="w-full items-center justify-start text-left"
              variant={archived ? "secondary" : "ghost"}
              iconLeft={<Archive size={18} />}
              onClick={toggleArchived}
            >
              <span className="ml-2">Archived</span>
            </Button>
          )}

          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="mt-auto flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none px-1 transition-colors"
            >
              <X size={12} />
              Clear filters
            </button>
          )}
        </div>

        {/* ── User list ── */}
        <div className="min-w-xs overflow-hidden px-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <SearchInput
              placeholder="Search users..."
              value={search}
              onChange={(value) => { setPage(1); setSearch(value); }}
              onClear={() => { setPage(1); setSearch(""); }}
              className="border-white flex-1"
            />
            {isFetching && !isLoading && <Spinner size={16} />}
          </div>

          {role && status === "active" && (
            <div className="flex items-center px-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Active only
              </span>
            </div>
          )}

          {isLoading ? (
            <PageLoader />
          ) : isError ? (
            <Alert variant="error">Failed to load users. Please try again.</Alert>
          ) : users.length === 0 ? (
            <EmptyState
              icon={emptyState.icon}
              iconColor={emptyState.color}
              title={emptyState.title}
              subtitle={emptyState.subtitle}
            />
          ) : (
            <CompactCard
              title="Team members"
              users={formattedUsers}
              onView={openView}
              onEdit={canEdit && !archived ? openEdit : undefined}
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
        <div className="w-full ">
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