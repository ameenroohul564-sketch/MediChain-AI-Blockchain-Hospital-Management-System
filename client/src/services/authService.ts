import api from "./api";

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  role?: "patient";
}

interface LoginData {
  email: string;
  password: string;
}

// ======================================================
// REGISTER
// ======================================================

export const registerUser =
  async (
    data: RegisterData
  ) => {
    const response =
      await api.post(
        "/auth/register",
        data
      );

    return response.data;
  };

// ======================================================
// LOGIN
// ======================================================

export const loginUser =
  async (
    data: LoginData
  ) => {
    const response =
      await api.post(
        "/auth/login",
        data
      );

    return response.data;
  };

// ======================================================
// GET DOCTORS
// ======================================================

export const getDoctors =
  async () => {
    const response =
      await api.get(
        "/auth/doctors"
      );

    return response.data;
  };