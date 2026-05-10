import { useEffect } from "react";

import { getMe } from "../services/auth.service";

import { useAuthStore } from "../store/auth.store";

export const useAuth = () => {
  const setUser =
    useAuthStore(
      (state) => state.setUser
    );

  const logout =
    useAuthStore(
      (state) => state.logout
    );

  const setLoading =
    useAuthStore(
      (state) =>
        state.setLoading
    );

  useEffect(() => {
    const restoreSession =
      async () => {
        try {
          const response =
            await getMe();

          setUser(
            response.data.user
          );
        } catch (error) {
          logout();
        } finally {
          setLoading(false);
        }
      };

    restoreSession();
  }, [
    setUser,
    logout,
    setLoading,
  ]);
};