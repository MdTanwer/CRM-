import axios from "axios";
import { API_BASE_URL, AUTH_API } from "../config/api.config";

interface AuthResponse {
  status: string;
  token: string;
  data: {
    user: {
      _id: string;
      email: string;
      role: string;
      employeeId?: string;
      name?: string;
    };
  };
}

// Login user
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post<AuthResponse>(`${AUTH_API}/login`, {
      email,
      password,
    });

    return {
      token: response.data.token,
      user: response.data.data.user,
    };
  } catch (error) {
    throw new Error(
      axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : "Login failed"
    );
  }
};

// Get current user
export const getCurrentUser = async (token: string) => {
  try {
    const response = await axios.get<AuthResponse>(`${AUTH_API}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data.user;
  } catch (error) {
    throw new Error(
      axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : "Failed to get user information"
    );
  }
};

// Logout user
export const logoutUser = async (token: string) => {
  try {
    // This is optional - can be used for server-side logging or token blacklisting
    await axios.post(
      `${AUTH_API}/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    // Don't throw error for logout - frontend cleanup should proceed
    console.warn("Server logout failed, but proceeding with client logout");
  }
};

// Create axios instance with auth header
export const createAuthenticatedAxiosInstance = (token: string) => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
