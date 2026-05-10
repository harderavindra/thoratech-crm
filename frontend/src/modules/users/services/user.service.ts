import { api } from "../../../services/api";

export const createUser =
  async (payload: {
    username: string;
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: string;
  }) => {
    const response =
      await api.post(
        "/users",
        payload
      );

    return response.data;
  };