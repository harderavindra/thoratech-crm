import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUser, getUserById, getUsers, updateUser, deleteUser } from "../services/user.service";

export const useUsers = (params: {
  page: number;
  limit: number;
  search: string;
  role: string;
  status: string;
  archived?: boolean;
  refreshKey?: number;
}) =>
  useQuery({
    queryKey: ["users", params],
    queryFn: () => getUsers(params),
    placeholderData: (prev) => prev,
  });

export const useUserById = (id: string | null) =>
  useQuery({
    queryKey: ["users", id],
    queryFn: () => getUserById(id!),
    enabled: !!id,
    staleTime: 30_000,
  });

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateUser>[1] }) =>
      updateUser(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["users", id] });
    },
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason, comment }: { id: string; reason: string; comment?: string }) =>
      deleteUser(id, { reason, comment }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
};