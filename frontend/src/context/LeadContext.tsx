import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { useService } from "./ServiceContext";
import type {
  Lead,
  LeadFormData,
  LeadFilters,
  PaginatedResponse,
} from "../types";

// Define the context type
interface LeadContextType {
  leads: Lead[];
  isLoading: boolean;
  error: string | null;
  totalLeads: number;
  currentPage: number;
  totalPages: number;
  filters: LeadFilters;
  getLeads: (page?: number, filters?: Partial<LeadFilters>) => Promise<void>;
  getLead: (id: string) => Promise<Lead | null>;
  createLead: (leadData: LeadFormData) => Promise<Lead | null>;
  updateLead: (
    id: string,
    leadData: Partial<LeadFormData>
  ) => Promise<Lead | null>;
  deleteLead: (id: string) => Promise<boolean>;
  updateLeadStatus: (
    id: string,
    status: Lead["status"]
  ) => Promise<Lead | null>;
  assignLead: (id: string, employeeId: string) => Promise<Lead | null>;
  setFilters: (newFilters: Partial<LeadFilters>) => void;
  clearFilters: () => void;
}

// Create the context with a default value
const LeadContext = createContext<LeadContextType | undefined>(undefined);

// Props for the provider component
interface LeadProviderProps {
  children: ReactNode;
}

// Default filters
const defaultFilters: LeadFilters = {
  status: "all",
  type: "all",
  assignedTo: undefined,
  dateRange: undefined,
  searchTerm: undefined,
};

// Provider component
export const LeadProvider: React.FC<LeadProviderProps> = ({ children }) => {
  const { apiClient } = useService();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalLeads, setTotalLeads] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [filters, setFilters] = useState<LeadFilters>(defaultFilters);

  // Get leads with pagination and filters
  const getLeads = async (page = 1, newFilters?: Partial<LeadFilters>) => {
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

      if (currentFilters.type && currentFilters.type !== "all") {
        params.type = currentFilters.type;
      }

      if (currentFilters.assignedTo) {
        params.assignedTo = currentFilters.assignedTo;
      }

      if (currentFilters.dateRange) {
        params.startDate = currentFilters.dateRange.start;
        params.endDate = currentFilters.dateRange.end;
      }

      if (currentFilters.searchTerm) {
        params.search = currentFilters.searchTerm;
      }

      const response = await apiClient.get<PaginatedResponse<Lead>>("/leads", {
        params,
      });

      setLeads(response.data.data);
      setTotalLeads(response.data.pagination.total);
      setCurrentPage(response.data.pagination.page);
      setTotalPages(response.data.pagination.totalPages);

      // Update filters if new ones were provided
      if (newFilters) {
        setFilters({ ...filters, ...newFilters });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch leads");
      console.error("Error fetching leads:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get a single lead by ID
  const getLead = async (id: string): Promise<Lead | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<{ data: Lead }>(`/leads/${id}`);
      return response.data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch lead");
      console.error("Error fetching lead:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new lead
  const createLead = async (leadData: LeadFormData): Promise<Lead | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<{ data: Lead }>("/leads", leadData);
      // Refresh leads list after creation
      getLeads(currentPage);
      return response.data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create lead");
      console.error("Error creating lead:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update a lead
  const updateLead = async (
    id: string,
    leadData: Partial<LeadFormData>
  ): Promise<Lead | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.patch<{ data: Lead }>(
        `/leads/${id}`,
        leadData
      );

      // Update the lead in the local state
      setLeads((prev) =>
        prev.map((lead) => (lead.id === id ? response.data.data : lead))
      );

      return response.data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update lead");
      console.error("Error updating lead:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a lead
  const deleteLead = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.delete(`/leads/${id}`);

      // Remove the lead from the local state
      setLeads((prev) => prev.filter((lead) => lead.id !== id));
      setTotalLeads((prev) => prev - 1);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete lead");
      console.error("Error deleting lead:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update lead status
  const updateLeadStatus = async (
    id: string,
    status: Lead["status"]
  ): Promise<Lead | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.patch<{ data: Lead }>(
        `/leads/${id}/status`,
        { status }
      );

      // Update the lead in the local state
      setLeads((prev) =>
        prev.map((lead) => (lead.id === id ? response.data.data : lead))
      );

      return response.data.data;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update lead status"
      );
      console.error("Error updating lead status:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Assign lead to employee
  const assignLead = async (
    id: string,
    employeeId: string
  ): Promise<Lead | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.patch<{ data: Lead }>(
        `/leads/${id}/assign`,
        { employeeId }
      );

      // Update the lead in the local state
      setLeads((prev) =>
        prev.map((lead) => (lead.id === id ? response.data.data : lead))
      );

      return response.data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign lead");
      console.error("Error assigning lead:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update filters
  const updateFilters = (newFilters: Partial<LeadFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const value = {
    leads,
    isLoading,
    error,
    totalLeads,
    currentPage,
    totalPages,
    filters,
    getLeads,
    getLead,
    createLead,
    updateLead,
    deleteLead,
    updateLeadStatus,
    assignLead,
    setFilters: updateFilters,
    clearFilters,
  };

  return <LeadContext.Provider value={value}>{children}</LeadContext.Provider>;
};

// Custom hook to use the lead context
export const useLeads = (): LeadContextType => {
  const context = useContext(LeadContext);
  if (context === undefined) {
    throw new Error("useLeads must be used within a LeadProvider");
  }
  return context;
};
