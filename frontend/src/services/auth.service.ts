import axios from "axios";

const API_URL = "http://localhost:3000/api/v1/auth";

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
export const loginUser = async (email: string) => {
  try {
    const response = await axios.post<AuthResponse>(`${API_URL}/login`, {
      email,
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
    const response = await axios.get<AuthResponse>(`${API_URL}/me`, {
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

// Create axios instance with auth header
export const createAuthenticatedAxiosInstance = (token: string) => {
  return axios.create({
    baseURL: "http://localhost:3000/api/v1",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
