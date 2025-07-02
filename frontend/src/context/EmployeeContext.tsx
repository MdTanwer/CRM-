import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { useService } from "./ServiceContext";
import type { PaginatedResponse } from "../types";
import { EMPLOYEE_API } from "../config/api.config";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  preferredLanguage: string;
  assignedLeads: number;
  closedLeads: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  preferredLanguage: string;
  status?: "active" | "inactive";
}

interface EmployeeFilters {
  status?: "active" | "inactive" | "all";
  location?: string;
  language?: string;
  searchTerm?: string;
}

// Define the context type
interface EmployeeContextType {
  employees: Employee[];
  isLoading: boolean;
  error: string | null;
  totalEmployees: number;
  currentPage: number;
  totalPages: number;
  filters: EmployeeFilters;
  getEmployees: (
    page?: number,
    filters?: Partial<EmployeeFilters>
  ) => Promise<void>;
  getEmployee: (id: string) => Promise<Employee | null>;
  createEmployee: (employeeData: EmployeeFormData) => Promise<Employee | null>;
  updateEmployee: (
    id: string,
    employeeData: Partial<EmployeeFormData>
  ) => Promise<Employee | null>;
  deleteEmployee: (id: string) => Promise<boolean>;
  updateEmployeeStatus: (
    id: string,
    status: "active" | "inactive"
  ) => Promise<Employee | null>;
  getEmployeeStats: () => Promise<any>;
  setFilters: (newFilters: Partial<EmployeeFilters>) => void;
  clearFilters: () => void;
}

// Create the context with a default value
const EmployeeContext = createContext<EmployeeContextType | undefined>(
  undefined
);

// Props for the provider component
interface EmployeeProviderProps {
  children: ReactNode;
}

// Default filters
const defaultFilters: EmployeeFilters = {
  status: "all",
  location: undefined,
  language: undefined,
  searchTerm: undefined,
};

// API endpoint
const API_ENDPOINT = EMPLOYEE_API;

// Provider component
export const EmployeeProvider: React.FC<EmployeeProviderProps> = ({
  children,
}) => {
  const { apiClient } = useService();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalEmployees, setTotalEmployees] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [filters, setFilters] = useState<EmployeeFilters>(defaultFilters);

  // Get employees with pagination and filters
  const getEmployees = async (
    page = 1,
    newFilters?: Partial<EmployeeFilters>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Apply new filters if provided
      const currentFilters = newFilters
        ? { ...filters, ...newFilters }
        : filters;

      // Build query parameters
      const params: Record<string, any> = { page };

      if (currentFilters.status && currentFilters.status !== "all") {
        params.status = currentFilters.status;
      }

      if (currentFilters.location) {
        params.location = currentFilters.location;
      }

      if (currentFilters.language) {
        params.language = currentFilters.language;
      }

      if (currentFilters.searchTerm) {
        params.search = currentFilters.searchTerm;
      }

      const response = await apiClient.get<PaginatedResponse<Employee>>(
        API_ENDPOINT,
        { params }
      );

      setEmployees(response.data.data);
      setTotalEmployees(response.data.pagination.total);
      setCurrentPage(response.data.pagination.page);
      setTotalPages(response.data.pagination.totalPages);

      // Update filters if new ones were provided
      if (newFilters) {
        setFilters({ ...filters, ...newFilters });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch employees"
      );
      console.error("Error fetching employees:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get a single employee by ID
  const getEmployee = async (id: string): Promise<Employee | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<{ data: Employee }>(
        `${API_ENDPOINT}/${id}`
      );
      return response.data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch employee");
      console.error("Error fetching employee:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new employee
  const createEmployee = async (
    employeeData: EmployeeFormData
  ): Promise<Employee | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<{ data: Employee }>(
        API_ENDPOINT,
        employeeData
      );
      // Refresh employees list after creation
      getEmployees(currentPage);
      return response.data.data;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create employee"
      );
      console.error("Error creating employee:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an employee
  const updateEmployee = async (
    id: string,
    employeeData: Partial<EmployeeFormData>
  ): Promise<Employee | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.patch<{ data: Employee }>(
        `${API_ENDPOINT}/${id}`,
        employeeData
      );

      // Update the employee in the local state
      setEmployees((prev) =>
        prev.map((employee) =>
          employee.id === id ? response.data.data : employee
        )
      );

      return response.data.data;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update employee"
      );
      console.error("Error updating employee:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an employee
  const deleteEmployee = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.delete(`${API_ENDPOINT}/${id}`);

      // Remove the employee from the local state
      setEmployees((prev) => prev.filter((employee) => employee.id !== id));
      setTotalEmployees((prev) => prev - 1);

      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete employee"
      );
      console.error("Error deleting employee:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update employee status
  const updateEmployeeStatus = async (
    id: string,
    status: "active" | "inactive"
  ): Promise<Employee | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.patch<{ data: Employee }>(
        `${API_ENDPOINT}/${id}/status`,
        { status }
      );

      // Update the employee in the local state
      setEmployees((prev) =>
        prev.map((employee) =>
          employee.id === id ? response.data.data : employee
        )
      );

      return response.data.data;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update employee status"
      );
      console.error("Error updating employee status:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get employee statistics
  const getEmployeeStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(`${API_ENDPOINT}/stats`);
      return response.data;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch employee statistics"
      );
      console.error("Error fetching employee statistics:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update filters
  const updateFilters = (newFilters: Partial<EmployeeFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const value = {
    employees,
    isLoading,
    error,
    totalEmployees,
    currentPage,
    totalPages,
    filters,
    getEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    updateEmployeeStatus,
    getEmployeeStats,
    setFilters: updateFilters,
    clearFilters,
  };

  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  );
};

// Custom hook to use the employee context
export const useEmployees = (): EmployeeContextType => {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error("useEmployees must be used within an EmployeeProvider");
  }
  return context;
};
