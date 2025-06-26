import axios from "axios";
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { API_BASE_URL, API_TIMEOUT, STORAGE_KEYS } from "../constants";
import type { ApiResponse, PaginatedResponse } from "../types";

// Generic request data type
export type RequestData = Record<string, unknown> | FormData;

// Progress event type for file uploads
export interface UploadProgressEvent {
  loaded: number;
  total?: number;
  progress?: number;
}

// Extended config type for retry functionality
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * API Client Configuration
 */
class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const original = error.config as ExtendedAxiosRequestConfig;

        if (error.response?.status === 401 && original && !original._retry) {
          original._retry = true;

          try {
            const refreshToken = localStorage.getItem(
              STORAGE_KEYS.REFRESH_TOKEN
            );
            if (refreshToken) {
              const response = await this.post<{ accessToken: string }>(
                "/auth/refresh",
                {
                  refreshToken,
                }
              );
              const { accessToken } = response.data;

              localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
              if (original.headers) {
                original.headers.Authorization = `Bearer ${accessToken}`;
              }

              return this.instance(original);
            }
          } catch {
            // Refresh failed, redirect to login
            this.clearAuth();
            window.location.href = "/login";
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private clearAuth() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }

  // Generic request methods
  async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.instance.get(
      url,
      config
    );
    return response.data;
  }

  async post<T>(
    url: string,
    data?: RequestData,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.instance.post(
      url,
      data,
      config
    );
    return response.data;
  }

  async put<T>(
    url: string,
    data?: RequestData,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.instance.put(
      url,
      data,
      config
    );
    return response.data;
  }

  async patch<T>(
    url: string,
    data?: RequestData,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.instance.patch(
      url,
      data,
      config
    );
    return response.data;
  }

  async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.instance.delete(
      url,
      config
    );
    return response.data;
  }

  // Paginated requests
  async getPaginated<T>(
    url: string,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ): Promise<PaginatedResponse<T>> {
    const response: AxiosResponse<PaginatedResponse<T>> =
      await this.instance.get(url, {
        ...config,
        params,
      });
    return response.data;
  }

  // File upload
  async uploadFile<T>(
    url: string,
    file: File,
    onUploadProgress?: (progressEvent: UploadProgressEvent) => void,
    additionalData?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append("file", file);

    if (additionalData) {
      Object.keys(additionalData).forEach((key) => {
        const value = additionalData[key];
        if (value !== undefined) {
          formData.append(key, String(value));
        }
      });
    }

    const response: AxiosResponse<ApiResponse<T>> = await this.instance.post(
      url,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress,
      }
    );

    return response.data;
  }

  // Download file
  async downloadFile(url: string, filename?: string): Promise<void> {
    const response = await this.instance.get(url, {
      responseType: "blob",
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  // Get raw axios instance for custom requests
  getInstance(): AxiosInstance {
    return this.instance;
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();

// Export type for use in other services
export type { ApiClient };
