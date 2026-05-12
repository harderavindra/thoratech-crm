import { useState, useEffect } from "react";
import {
  Mail, Phone, ShieldCheck, UserRoundCheck,
  Calendar, Clock, KeyRound, Pencil, X,
} from "lucide-react";

import { useAuthStore } from "../../auth/store/auth.store";
import { useUserById } from "../../users/hooks/use-users";
import { useUpdateProfile, useChangePassword } from "../hooks/use-profile";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import Avatar from "../../../components/ui/avatar";
import { PageHeader } from "../../../components/ui/page-header";
import { Alert } from "../../../components/ui/alert";
import { Spinner } from "../../../components/ui/loader";
import { useToast } from "../../../components/ui/toast";

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
  <div className="flex items-start gap-3 py-2.5 border-b border-gray-100  flex-1">
    <span className="mt-0.5 text-gray-400 shrink-0">{icon}</span>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 break-all">{value}</p>
    </div>
  </div>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mt-6 mb-2">
    {children}
  </p>
);

type FieldErrors = Partial<Record<string, string>>;

// ─────────────────────────────────────────────────────────────
// Edit Profile Form
// ─────────────────────────────────────────────────────────────

const EditProfileForm = ({
  initialFullName,
  initialPhone,
  onClose,
}: {
  initialFullName: string;
  initialPhone: string;
  onClose: () => void;
}) => {
  const toast = useToast();
  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone]       = useState(initialPhone);
  const [errors, setErrors]     = useState<FieldErrors>({});

  const updateProfile = useUpdateProfile();
  const apiError = (updateProfile.error as any)?.response?.data?.message ?? "";

  const validate = () => {
    const e: FieldErrors = {};
    if (!fullName.trim()) e.fullName = "Full name is required";
    if (!phone.trim())    e.phone    = "Phone is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (!validate()) return;
    updateProfile.mutate({ fullName, phone }, { onSuccess: () => { toast.success("Profile updated"); onClose(); } });
  };

  return (
    <div className="w-full rounded-2xl bg-white p-12 relative">
        <Button iconOnly iconLeft={<X size={16} />} size="sm" variant="primary" onClick={onClose} className="absolute -right-2 -top-2" aria-label="Close" />
      <div className="mb-6 flex items-center justify-between " >
        <div>
          <h2 className="text-2xl font-bold">Edit Profile</h2>
          <p className="mt-1 text-sm text-gray-400">Update your name and phone number</p>
        </div>
      </div>

      {apiError && <Alert variant="error" className="mb-4">{apiError}</Alert>}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Input
          label="Full Name"
          value={fullName}
          onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: undefined })); }}
          placeholder="Enter full name"
          error={errors.fullName}
        />

        <Input
          label="Phone"
          type="tel"
          value={phone}
          onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: undefined })); }}
          placeholder="Enter phone number"
          error={errors.phone}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={updateProfile.isPending}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Change Password Form
// ─────────────────────────────────────────────────────────────

const ChangePasswordForm = ({ onClose }: { onClose: () => void }) => {
  const toast = useToast();
  const [current,  setCurrent]  = useState("");
  const [next,     setNext]     = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [errors,   setErrors]   = useState<FieldErrors>({});

  const changePassword = useChangePassword();
  const apiError = (changePassword.error as any)?.response?.data?.message ?? "";

  const validate = () => {
    const e: FieldErrors = {};
    if (!current)        e.current  = "Current password is required";
    if (next.length < 8) e.next     = "Password must be at least 8 characters";
    if (next !== confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (!validate()) return;
    changePassword.mutate(
      { currentPassword: current, newPassword: next },
      {
        onSuccess: () => {
          toast.success("Password changed successfully.");
          onClose();
        },
      },
    );
  };

  return (
    <div className="w-full rounded-2xl bg-white p-12 relative">
        <Button iconOnly iconLeft={<X size={16} />} size="sm" variant="primary" onClick={onClose} className="absolute -right-2 -top-2" aria-label="Close" />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Change Password</h2>
          <p className="mt-1 text-sm text-gray-400">Must be at least 10 characters with uppercase, lowercase, number and special character</p>
        </div>
      </div>

      {apiError && <Alert variant="error" className="mb-4">{apiError}</Alert>}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {[
          { label: "Current Password", value: current, set: setCurrent, key: "current" },
          { label: "New Password",     value: next,    set: setNext,    key: "next"    },
          { label: "Confirm Password", value: confirm, set: setConfirm, key: "confirm" },
        ].map(({ label, value, set, key }) => (
          <Input
            key={key}
            label={label}
            type="password"
            value={value}
            onChange={(e) => { set(e.target.value); setErrors((p) => ({ ...p, [key]: undefined })); }}
            placeholder="••••••••"
            error={(errors as any)[key]}
          />
        ))}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={changePassword.isPending}>Update Password</Button>
        </div>
      </form>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

type Panel = "edit" | "password" | null;

export const ProfilePage = () => {
  const authUser  = useAuthStore((s) => s.user);
  const [panel, setPanel] = useState<Panel>(null);

  const { data, isLoading, isError } = useUserById(authUser?.id ?? null);
  const user = data?.data?.user;

  const fullName = user?.fullName ?? authUser?.fullName ?? "";
  const phone    = user?.phone    ?? "";
  const isActive = (user?.status ?? authUser?.status) === "active";

  // Close panel when user navigates away via keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setPanel(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="flex flex-col flex-1">

      <PageHeader title="Profile" />

      <div className="flex gap-1 flex-1">

        {/* ── Left: profile info card ── */}
        <div className=" rounded-2xl bg-white p-8 overflow-y-auto flex-1">

          {/* Avatar + name */}
          <div className="flex flex-col items-center text-center gap-3 mb-6">
            <Avatar size="xl" initials={getInitials(fullName)} AvatarColor="blue" />
            <div>
              <p className="text-xl font-bold">{fullName || "—"}</p>
              {authUser?.username && <p className="text-sm text-gray-400">@{authUser.username}</p>}
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-gray-300"}`} />
                  {toTitleCase(authUser?.status ?? "active")}
                </span>
                <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                  {toTitleCase(authUser?.role ?? "")}
                </span>
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="flex justify-center mb-4">
              <Spinner size={18} />
            </div>
          )}
          {isError && <Alert variant="error" className="mb-4">Failed to load profile data.</Alert>}

          {/* Contact */}
          <SectionLabel>Contact</SectionLabel>
                <div className="flex w-full">

          <MetaRow icon={<Mail size={15} />} label="Email" value={<a href={`mailto:${authUser?.email}`} className="text-blue-600 hover:underline">{authUser?.email}</a>} />
          <MetaRow icon={<Phone size={15} />} label="Phone" value={phone || "—"} />
</div>
          {/* Role & access */}
          <SectionLabel>Role & access</SectionLabel>
                <div className="flex w-full">

          <MetaRow icon={<ShieldCheck size={15} />} label="Role" value={toTitleCase(authUser?.role ?? "")} />
          <MetaRow icon={<UserRoundCheck size={15} />} label="Status" value={toTitleCase(authUser?.status ?? "")} />
</div>
          {/* Activity */}
          {user && (
            <>
              <SectionLabel>Activity</SectionLabel>
                    <div className="flex w-full">

              <MetaRow icon={<Calendar size={15} />} label="Joined" value={formatDate(user.createdAt)} />
              {user.lastLogin && <MetaRow icon={<Clock size={15} />} label="Last login" value={formatDateTime(user.lastLogin)} />}
              </div>
            </>
          )}

         

        </div>

        {/* ── Right: form panel ── */}
        <div className="relative flex-1  px-8  ">
           {/* Actions */}
          <div className=" flex gap-10 pb-10">
            <Button
              variant={panel === "edit" ? "primary" : "secondary"}
              iconLeft={<Pencil size={14} />}
              onClick={() => setPanel((p) => p === "edit" ? null : "edit")}
              className="w-full"
            >
              Edit Profile
            </Button>
            <Button
              variant={panel === "password" ? "primary" : "secondary"}
              iconLeft={<KeyRound size={14} />}
              onClick={() => setPanel((p) => p === "password" ? null : "password")}
              className="w-full"
            >
              Change Password
            </Button>
          </div>
          {panel === "edit" && (
            <EditProfileForm
              initialFullName={fullName}
              initialPhone={phone}
              onClose={() => setPanel(null)}
            />
          )}
          {panel === "password" && (
            <ChangePasswordForm onClose={() => setPanel(null)} />
          )}
        </div>

      </div>
    </div>
  );
};
