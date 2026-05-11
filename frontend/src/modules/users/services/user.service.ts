import { api } from "../../../services/api";

import type { ApiUser, UserRole, UserStatus, PaginatedUsers } from "../../../types/user.types";

export type { ApiUser, UserRole, UserStatus, PaginatedUsers };

export const getUsers = (params: {
  page: number;
  limit: number;
  search: string;
  role: string;
  status: string;
}) =>
  api
    .get<{ success: boolean; data: PaginatedUsers }>("/users", { params })
    .then((r) => r.data);

export const getUserById = (id: string) =>
  api
    .get<{ success: boolean; data: { user: ApiUser } }>(`/users/${id}`)
    .then((r) => r.data);

export const createUser = (payload: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  status?: UserStatus;
}) =>
  api
    .post<{ success: boolean; message: string; data: { user: ApiUser } }>("/users", payload)
    .then((r) => r.data);

export const updateUser = (
  id: string,
  payload: Partial<Pick<ApiUser, "fullName" | "email" | "phone" | "role" | "status">>,
) =>
  api
    .patch<{ success: boolean; message: string; data: { user: ApiUser } }>(`/users/${id}`, payload)
    .then((r) => r.data);


    export const deleteUser = (id: string) =>
  api
    .delete<{ success: boolean; message: string }>(`/users/${id}`)
    .then((r) => r.data);
 