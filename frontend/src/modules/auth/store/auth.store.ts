import { create } from "zustand";

interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
}

interface AuthState {
  user: User | null;

  isAuthenticated: boolean;

  isLoading: boolean;

  setUser: (
    user: User
  ) => void;

  logout: () => void;

  setLoading: (
    value: boolean
  ) => void;
}

export const useAuthStore =
  create<AuthState>((set) => ({
    user: null,

    isAuthenticated: false,

    isLoading: true,

    setUser: (user) =>
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      }),

    logout: () =>
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }),

    setLoading: (value) =>
      set({
        isLoading: value,
      }),
  }));