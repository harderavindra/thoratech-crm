import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useCreateUser, useUpdateUser } from "../modules/users/hooks/use-users";
import { useAuthStore } from "../modules/auth/store/auth.store";
import { getCreatableRoles } from "../utils/role-permissions";
import { Alert } from "./ui/alert";
import { useToast } from "./ui/toast";

// ← shared type, not re-declared locally
import type { ApiUser, UserRole, UserStatus } from "../types/user.types";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type AddUserFormProps = {
  mode?: "add" | "edit";
  user?: ApiUser | null;
  onClose?: () => void;
};

type FieldErrors = Partial<Record<
  "fullName" | "email" | "phone" | "password" | "role" | "status",
  string
>>;

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const STATUSES: { value: UserStatus; label: string }[] = [
  { value: "active",   label: "Active"   },
  { value: "inactive", label: "Inactive" },
];

const EMPTY_FORM = {
  fullName: "",
  email:    "",
  phone:    "",
  password: "",
  role:     "AGENT" as UserRole,
  status:   "active" as UserStatus,
};

// ─────────────────────────────────────────────────────────────
// Error helpers
// ─────────────────────────────────────────────────────────────

type AxiosLike = {
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
  };
};

function parseApiError(err: unknown): { global: string; fields: FieldErrors } {
  if (!err) return { global: "", fields: {} };

  const data = (err as AxiosLike).response?.data;
  if (!data) return { global: "Something went wrong", fields: {} };

  if (data.errors) {
    const fields: FieldErrors = {};
    let global = "";

    for (const [key, msgs] of Object.entries(data.errors)) {
      const msg = msgs[0] ?? "";
      if (key in EMPTY_FORM) {
        (fields as Record<string, string>)[key] = msg;
      } else {
        global = global ? `${global}, ${msg}` : msg;
      }
    }

    return { global, fields };
  }

  return { global: data.message ?? "Something went wrong", fields: {} };
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export const AddUserForm = ({ mode = "add", user, onClose }: AddUserFormProps) => {
  const toast        = useToast();
  const actorRole   = useAuthStore((s) => s.user?.role ?? "");
  const allowedRoles = getCreatableRoles(actorRole);
  const canEditRole  = actorRole === "SUPER_ADMIN" || actorRole === "ADMIN";

  const [form, setForm]       = useState({ ...EMPTY_FORM, role: allowedRoles[0] ?? "AGENT" as UserRole });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const isPending = createUser.isPending || updateUser.isPending;
  const apiError  = createUser.error     || updateUser.error;

  const { global: globalError, fields: serverFieldErrors } = parseApiError(apiError);

  // Merge server field errors into local field errors
  const errors: FieldErrors = { ...fieldErrors, ...serverFieldErrors };

  // ── Populate form when switching to edit mode ─────────────
  useEffect(() => {
    if (mode === "edit" && user) {
      setForm({
        fullName: user.fullName,
        email:    user.email,
        phone:    user.phone    ?? "",
        password: "",               // never pre-fill password
        role:     user.role    as UserRole,
        status:   user.status  as UserStatus,
      });
    } else {
      setForm({ ...EMPTY_FORM, role: allowedRoles[0] ?? "AGENT" as UserRole });
    }
    setFieldErrors({});
    createUser.reset();
    updateUser.reset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, user?._id]);            // user?._id so deep object changes don't re-trigger

  // ── Field change ──────────────────────────────────────────
  const set = <K extends keyof typeof EMPTY_FORM>(key: K, value: typeof EMPTY_FORM[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // clear the field error as the user types
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  // ── Client-side validation ────────────────────────────────
  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (mode === "add") {
      if (!form.email.trim())                              errs.email    = "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email    = "Enter a valid email";
      if (form.password.length < 8)                       errs.password = "Password must be at least 8 characters";
    }
    if (!form.phone.trim()) errs.phone = "Phone is required";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (mode === "edit" && user) {
      updateUser.mutate(
        { id: user._id, payload: { fullName: form.fullName, phone: form.phone, role: form.role } },
        { onSuccess: () => { toast.success("User updated"); onClose?.(); } },
      );
    } else {
      createUser.mutate(
        { fullName: form.fullName, email: form.email, phone: form.phone, password: form.password, role: form.role, status: form.status },
        { onSuccess: () => { toast.success("User created"); onClose?.(); } },
      );
    }
  };

  // ─────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────

  return (
    <div className="w-full">
      <div className="relative w-full rounded-2xl bg-white p-12">

        {/* Header */}
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
            aria-label="Close"
          />
        </div>

        {globalError && <Alert variant="error" className="mb-4">{globalError}</Alert>}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          {/* Full name */}
          <Input
            label="Full Name"
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            placeholder="Enter full name"
            error={errors.fullName}
          />

          {/* Email — add mode only */}
          {mode === "add" && (
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="Enter email"
              error={errors.email}
            />
          )}

          {/* Phone */}
          <Input
            label="Phone"
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="Enter phone number"
            error={errors.phone}
          />

          {/* Password — add mode only */}
          {mode === "add" && (
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="Min. 8 characters"
              error={errors.password}
            />
          )}

          {/* Role — hidden for TEAM_LEAD in edit mode (they can only change status) */}
          {(mode === "add" || canEditRole) && (
            <Field label="Role" error={errors.role}>
              <select
                value={form.role}
                onChange={(e) => set("role", e.target.value as UserRole)}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
              >
                {allowedRoles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </Field>
          )}

          {/* Status — add mode only */}
          {mode === "add" && (
            <Field label="Status" error={errors.status}>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value as UserStatus)}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </Field>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isPending}>
              {mode === "edit" ? "Update User" : "Create User"}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Field wrapper — label + input slot + inline error message
// ─────────────────────────────────────────────────────────────

const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    {children}
    {error && (
      <p className="mt-1 text-[12px] text-red-500">{error}</p>
    )}
  </div>
);