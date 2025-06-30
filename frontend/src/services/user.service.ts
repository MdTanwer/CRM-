import { createAuthenticatedAxiosInstance } from "./auth.service";

const API_URL = "http://localhost:3000/api/v1/users";

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
}

// Get user profile
export const getUserProfile = async (token: string) => {
  try {
    const axiosInstance = createAuthenticatedAxiosInstance(token);
    const response = await axiosInstance.get(`${API_URL}/profile`);
    return response.data.data.user;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (
  token: string,
  profileData: Partial<UserProfile>
) => {
  try {
    const axiosInstance = createAuthenticatedAxiosInstance(token);
    const response = await axiosInstance.patch(
      `${API_URL}/profile`,
      profileData
    );
    return response.data.data.user;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Update user password
export const updateUserPassword = async (
  token: string,
  currentPassword: string,
  newPassword: string
) => {
  try {
    const axiosInstance = createAuthenticatedAxiosInstance(token);
    const response = await axiosInstance.patch(`${API_URL}/update-password`, {
      currentPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating user password:", error);
    throw error;
  }
};
