import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../modules/auth/store/auth.store";

interface RoleRouteProps {
  children: ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export const RoleRoute = ({ children, allowedRoles, redirectTo = "/" }: RoleRouteProps) => {
  const user = useAuthStore((s) => s.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};
