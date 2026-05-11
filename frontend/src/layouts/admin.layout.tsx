import { Link, Outlet, useNavigate } from "react-router-dom";

import { logoutUser } from "../modules/auth/services/auth.service";

import { useAuthStore } from "../modules/auth/store/auth.store";
import {
  ContactRound,
  LayoutDashboard,
  PanelLeftClose,
  Users,
} from "lucide-react";
import Logo from "../components/ui/logo";
import Avatar from "../components/ui/avatar";
import { useState } from "react";

export const AdminLayout = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      await logoutUser();

      logout();

      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };
  const getInitials = (name: string | undefined) => {
    if (!name) return "";
    const names = name.trim().split(" ");
    // Takes first character of first name and last name
    const initials =
      names.length > 1 ? names[0][0] + names[names.length - 1][0] : names[0][0];
    return initials.toUpperCase();
  };

  return (
    <div className="flex min-h-screen p-5 gap-5 bg-gray-100 ">
      <aside className="flex w-20 flex-col justify-between bg-white p-4 text-gray-800 rounded-2xl ">
        <div className="flex flex-col items-center gap-4">
          <Logo size="md" showWordmark={false} />

          <nav className="space-y-3">
            <Link to="/" className="block rounded px-3 py-2 hover:bg-white/10">
              <LayoutDashboard />
            </Link>

            <Link
              to="/users"
              className="block rounded px-3 py-2 hover:bg-white/10"
            >
              <Users />
            </Link>

            <Link
              to="/profile"
              className="block rounded px-3 py-2 hover:bg-white/10"
            >
              <ContactRound />
            </Link>
          </nav>
        </div>
        <div
          className="relative flex flex-col items-center gap-3"
          onMouseOver={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <Avatar initials={getInitials(user?.fullName)} />
          {open && (
            <div className="pl-4 py-0 absolute bottom-0  left-full ">
              <div className="rounded-xl bg-white p-4 shadow-2xl w-48">
                <p className="mb-2 text-xs text-gray-600">
                  Signed in as <br />
                  <span className="font-medium  text-sm text-gray-800">
                    {user?.email}
                  </span>
                  <span className="block text-base text-gray-500">
                    {user?.role}
                  </span>
                </p>
                <button
                  onClick={handleLogout}
                  className="block w-full cursor-pointer rounded-full px-3 py-2 bg-red-500 text-white hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          <div className="bg-red flex ">
            <PanelLeftClose size={16} />
          </div>
        </div>
      </aside>

      <main className="flex-1 flex bg-gray-50 p-6 rounded-2xl ">
        <Outlet />
      </main>
    </div>
  );
};
