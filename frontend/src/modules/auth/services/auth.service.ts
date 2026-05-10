import { api } from "../../../services/api";

export const loginUser = async (
  payload: {
    email: string;
    password: string;
  }
) => {
  const response =
    await api.post(
      "/auth/login",
      payload
    );

  return response.data;
};

export const getMe =
  async () => {
    const response =
      await api.get(
        "/auth/me"
      );

    return response.data;
  };

export const logoutUser =
  async () => {
    const response =
      await api.post(
        "/auth/logout"
      );

    return response.data;
  };