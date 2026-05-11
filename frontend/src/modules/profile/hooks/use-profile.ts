import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile, changePassword } from "../../auth/services/auth.service";
import { useAuthStore } from "../../auth/store/auth.store";

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const currentUser = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // Sync auth store so header/avatar updates immediately
      if (currentUser && data?.data?.user) {
        setUser({ ...currentUser, ...data.data.user });
      }
      qc.invalidateQueries({ queryKey: ["users", currentUser?.id] });
    },
  });
};

export const useChangePassword = () =>
  useMutation({ mutationFn: changePassword });
