import { useState } from "react";
import { AddUserForm } from "../../../components/add-user-form";
import { useUsers } from "../hooks/use-users";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

import {
  Headphones,
  Plus,
  ShieldCheck,
  User,
  UserCog,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  UserRoundCheck,
  X,
  Mail,
  Phone,
} from "lucide-react";

import { CompactCard } from "../../../components/user-card";
import Avatar, { type AvatarColor } from "../../../components/ui/avatar";

type ApiUser = {
  _id: string;
  fullName: string;
  email: string;
  phone:string;
  role: string;
  status: "active" | "away" | "offline";
  createdAt: string;
  initials?: string;

  avatarColor?: AvatarColor;
};

export const UsersPage = () => {
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");

  const [role, setRole] = useState("");

  const [status, setStatus] = useState("");

  const [editModelView, setEditModelView] = useState(false);

  const [viewModelStatus, setViewModelStatus] = useState(false);

  const [addModelStatus, setAddModelStatus] = useState(false);

  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);

  const { data, isLoading } = useUsers({
    page,
    limit: 10,
    search,
    role,
    status,
  });

  const users = data?.data?.users || [];

  const pagination = data?.data?.pagination;

  const convertCapitalCase = (str: string) => {
    return str
      .toLowerCase()
      .split(/[_\s-]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const roles = [
    {
      value: "SUPER_ADMIN",
      icon: <ShieldCheck size={18} />,
    },

    {
      value: "ADMIN",
      icon: <UserCog size={18} />,
    },

    {
      value: "TEAM_LEAD",
      icon: <User size={18} />,
    },

    {
      value: "AGENT",
      icon: <Headphones size={18} />,
    },

    {
      value: "QA",
      icon: <BadgeCheck size={18} />,
    },
  ];

  const openAddModal = () => {
    closeAllModals();
    setSelectedUser(null);

    setAddModelStatus(true);
  };

  const openEditModal = (userId: string) => {
    closeAllModals();
    const user = users.find((u: ApiUser) => u._id === userId);

    if (!user) return;

    setSelectedUser(user);

    setEditModelView(true);
  };

  const openViewModal = (userId: string) => {
    closeAllModals();
    const user = users.find((u: ApiUser) => u._id === userId);

    if (!user) return;

    setSelectedUser({
      ...user,

      initials: user.fullName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase(),

      avatarColor: "blue",
    });

    setViewModelStatus(true);
  };

  const closeAllModals = () => {
    setAddModelStatus(false);

    setEditModelView(false);

    setViewModelStatus(false);

    setSelectedUser(null);
  };

  const formattedUsers = users.map((user: ApiUser) => ({
    id: user._id,

    name: user.fullName,

    role: user.role,

    initials: user.fullName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase(),

    status: user.status,

    avatarColor: "blue" as const,

    openEditModal,

    openViewModal,
  }));

  return (
    <div className="flex flex-col flex-1 ">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users</h1>

        <Button iconOnly variant="primary" onClick={openAddModal}>
          <Plus />
        </Button>
      </div>

      <div className="flex gap-1 flex-1  ">
        {/* Sidebar Filters */}
        <div className="flex flex-col gap-4 rounded-xl bg-white p-4 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => {
                setPage(1);

                setSearch(e.target.value);
              }}
              className="pl-10"
            />
          </div>

          <label className="block text-sm text-gray-400">Role</label>

          <div className="flex flex-col items-center gap-2">
            {roles.map((r) => (
              <Button
                key={r.value}
                className="w-full items-center justify-start text-left"
                variant={role === r.value ? "secondary" : "ghost"}
                iconLeft={r.icon}
                onClick={() => {
                 setPage(1);
  setRole((prev) => prev === r.value ? "" : r.value);
                }}
              >
                <span className="ml-2">{convertCapitalCase(r.value)}</span>
              </Button>
            ))}
          </div>

          <label className="block text-sm text-gray-400">Status</label>

          <Button
            className="w-full items-center justify-start text-left"
            variant={status === "active" ? "secondary" : "ghost"}
            iconLeft={<UserRoundCheck size={18} />}
            onClick={() => {
             setPage(1);
  setStatus((prev) => prev === "active" ? "" : "active");
            }}
          >
            <span className="ml-2">Active</span>
          </Button>

          <Button
            className="w-full items-center justify-start text-left"
            variant={status === "inactive" ? "secondary" : "ghost"}
            iconLeft={<UserRoundCheck size={18} />}
            onClick={() => {
               setPage(1);
  setStatus((prev) => prev === "inactive" ? "" : "inactive");
            }}
          >
            <span className="ml-2">Inactive</span>
          </Button>
        </div>

        {/* User List */}
        <div className="min-w-xs overflow-hidden rounded-2xl bg-white ">
          {isLoading && (
            <div className="flex min-h-[200px] items-center justify-center">
              <p className="px-4 py-6 text-center">Loading...</p>
            </div>
          )}

          {!isLoading && (
            <CompactCard title="Team members" users={formattedUsers} />
          )}

          {/* Pagination */}
          <div className="mt-5 flex items-center justify-between px-5">
            <p className="text-xs text-gray-400">
              Page {pagination?.page} of {pagination?.totalPages}
            </p>

            <div className="flex gap-2">
              <Button
                className="w-auto px-4 py-2"
                disabled={page === 1}
                size="sm"
                variant="secondary"
                iconOnly
                iconLeft={<ChevronLeft size={12} />}
                onClick={() => setPage((prev) => prev - 1)}
              />

              <Button
                disabled={page === pagination?.totalPages}
                size="sm"
                variant="secondary"
                iconOnly
                iconLeft={<ChevronRight size={12} />}
                onClick={() => setPage((prev) => prev + 1)}
              />
            </div>
          </div>
        </div>
        <div className="w-full   ">
          {/* Add User */}
          {addModelStatus && (
            <AddUserForm mode="add" onClose={closeAllModals} />
          )}

          {/* Edit User */}
          {editModelView && selectedUser && (
            <AddUserForm
              mode="edit"
              user={selectedUser}
              onClose={closeAllModals}
            />
          )}

          {/* View User */}
          {viewModelStatus && selectedUser && (
            <div className="w-full rounded-2xl bg-white p-12 relative h-full">
              <Button
                iconOnly
                iconLeft={<X size={16} />}
                size="sm"
                variant="primary"
                onClick={closeAllModals}
                className="absolute right-5 top-5"
              ></Button>

              <div className="space-y-4 text-base">
                <Avatar
                  size="xl"
                  initials={selectedUser.initials}
                  AvatarColor={selectedUser?.avatarColor}
                />

                <div>
                  <p className="text-2xl font-bold">{selectedUser.fullName}</p>
                </div>

                <div>
                  <p className="flex gap-3 items-center">
                    <Mail size={16} /> {selectedUser.email}
                  </p>
                </div>
                  <div>
                  <p className="flex gap-3 items-center">
                    <Phone size={16} /> {selectedUser.phone}
                  </p>
                </div>
                <div>
                   <p className="flex gap-3 items-center">
                    <UserCog size={16} /> {
                    convertCapitalCase(selectedUser.role)}
                  </p>
                </div>

                <div>
                
                 <p className="flex gap-3 items-center">
                    <UserRoundCheck size={16} /> {
                    convertCapitalCase(selectedUser.status)}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setViewModelStatus(false);

                    setEditModelView(true);
                  }}
                >
                  Edit User
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
