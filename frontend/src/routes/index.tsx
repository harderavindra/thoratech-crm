import {
  createBrowserRouter,
} from "react-router-dom";

import { LoginPage } from "../modules/auth/pages/login.page";

import { DashboardPage } from "../modules/dashboard/pages/dashboard.page";
import { ProfilePage } from "../modules/profile/pages/profile.page";

import { UsersPage } from "../modules/users/pages/users.page";
import { AdminLayout } from "../layouts/admin.layout";

import { ProtectedRoute } from "../middleware/protected.route";
import { PublicRoute } from "../middleware/public.route";
import { RoleRoute } from "../middleware/role.route";

export const router =
  createBrowserRouter([
    {
     path: "/login",
  element: (
    <PublicRoute>
      <LoginPage />
    </PublicRoute>
  ),
    },

    {
      path: "/",
      element: (
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      ),

      children: [
        {
          index: true,
          element:
            <DashboardPage />,
        },

        {
          path: "profile",
          element:
            <ProfilePage />,
        },

        {
          path: "users",
          element: (
            <RoleRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
              <UsersPage />
            </RoleRoute>
          ),
        },
      ],
    },
  ]);