import { api } from "../../../services/api";

export const createUser = async (payload: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  status?: string;
}) => {
  const response = await api.post("/users", payload);

  return response.data;
};

export const updateUser = async (id: string, payload: {
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
}) => {
  const response = await api.put(`/users/${id}`, payload);

  return response.data;
};

interface GetUsersParams {
  page?: number;

  limit?: number;

  search?: string;

  role?: string;

  status?: string;
}

export const getUsers = async ({
  page = 1,
  limit = 10,
  search = "",
  role = "",
  status = "",
}: GetUsersParams) => {
  const params = new URLSearchParams({
    page: String(page),

    limit: String(limit),

    search,

    role,

    status,
  });

  const response = await api.get(`/users?${params}`);

  return response.data;
};
