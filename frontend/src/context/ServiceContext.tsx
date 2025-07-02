import React, { createContext, useContext } from "react";
import type { ReactNode } from "react";
import axios from "axios";
import { API_TIMEOUT } from "../constants";
import { AUTH_API } from "../config/api.config";

// Create a base Axios instance
const axiosInstance = axios.create({
  baseURL: "", // Empty base URL since we're using full URLs in the contexts
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Define the context type
interface ServiceContextType {
  apiClient: typeof axiosInstance;
}

// Create the context with a default value
const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

// Props for the provider component
interface ServiceProviderProps {
  children: ReactNode;
}

// Provider component
export const ServiceProvider: React.FC<ServiceProviderProps> = ({
  children,
}) => {
  // Set up request interceptor for authentication
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("access_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Set up response interceptor for error handling
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Handle token refresh on 401 errors
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshToken = localStorage.getItem("refresh_token");
          if (refreshToken) {
            const response = await fetch(`${AUTH_API}/refresh`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                refreshToken,
              }),
            });

            const { accessToken } = await response.json();
            localStorage.setItem("access_token", accessToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }

            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          // Refresh token failed, redirect to login
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  const value = {
    apiClient: axiosInstance,
  };

  return (
    <ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>
  );
};

// Custom hook to use the service context
export const useService = (): ServiceContextType => {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error("useService must be used within a ServiceProvider");
  }
  return context;
};
