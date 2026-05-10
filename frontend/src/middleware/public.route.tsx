import type {
  ReactNode,
} from "react";

import {
  Navigate,
} from "react-router-dom";

import { useAuthStore } from "../modules/auth/store/auth.store";

export const PublicRoute = ({
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

  if (isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
};