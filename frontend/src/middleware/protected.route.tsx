import type {
  ReactNode,
} from "react";

import {
  Navigate,
} from "react-router-dom";

import { useAuthStore } from "../modules/auth/store/auth.store";

export const ProtectedRoute = ({
  children,
}: {
  children: ReactNode;
}) => {
  const {
    isAuthenticated,
    isLoading,
  } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
};