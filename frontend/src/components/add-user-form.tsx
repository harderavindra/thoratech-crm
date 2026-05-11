import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { X } from "lucide-react";
import { useCreateUser, useUpdateUser } from "../modules/users/hooks/use-users";

type ApiUser = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
};

type AddUserFormProps = {
  mode?: "add" | "edit";
  user?: ApiUser | null;
  onClose?: () => void;
};

const roles = [
  "SUPER_ADMIN",
  "ADMIN",
  "TEAM_LEAD",
  "AGENT",
  "QA",
];

export const AddUserForm = ({
  mode = "add",
  user,
  onClose,
}: AddUserFormProps) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("ADMIN");
  const [status, setStatus] = useState("active");
  const [password, setPassword] = useState("");

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const isPending = createUser.isPending || updateUser.isPending;
  const error = createUser.error || updateUser.error;

  useEffect(() => {
    if (mode === "edit" && user) {
      setFullName(user.fullName);
      setEmail(user.email);
      setPhone(user.phone ?? "");
      setRole(user.role);
      setStatus(user.status);
    }
  }, [mode, user]);

  const getErrorMessage = (err: unknown): string => {
    if (!err) return "";
    const axiosError = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
    const data = axiosError.response?.data;
    if (data?.errors) {
      return Object.values(data.errors).flat().join(", ");
    }
    return data?.message ?? "Something went wrong";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "edit" && user) {
      updateUser.mutate(
        {
          id: user._id,
          payload: { fullName, email, phone, role, status },
        },
        { onSuccess: () => onClose?.() },
      );
    } else {
      createUser.mutate(
        { fullName, email, phone, password, role, status },
        { onSuccess: () => onClose?.() },
      );
    }
  };

  return (
    <div className="w-full">
      <div className="w-full rounded-2xl bg-white p-12 relative">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {mode === "edit" ? "Edit User" : "Add User"}
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              {mode === "edit" ? "Update user information" : "Create a new user"}
            </p>
          </div>

          <Button
            iconOnly
            iconLeft={<X size={16} />}
            size="sm"
            variant="primary"
            onClick={onClose}
            className="absolute right-5 top-5"
          />
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {getErrorMessage(error)}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">Full Name</label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Phone</label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              required
            />
          </div>

          {mode === "add" && (
            <div>
              <label className="mb-2 block text-sm font-medium">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-black"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-black"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit" variant="primary" disabled={isPending}>
              {isPending
                ? "Saving..."
                : mode === "edit"
                ? "Update User"
                : "Create User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
