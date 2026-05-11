import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createUser, getUsers, updateUser } from "../services/user.service";

interface UseUsersProps {
  page: number;

  limit: number;

  search: string;

  role: string;

  status: string;
}

export const useUsers = ({
  page,
  limit,
  search,
  role,
  status,
}: UseUsersProps) => {
  return useQuery({
    queryKey: ["users", page, limit, search, role, status],

    queryFn: () =>
      getUsers({
        page,
        limit,
        search,
        role,
        status,
      }),

    placeholderData: (previousData) => previousData,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateUser>[1] }) =>
      updateUser(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
