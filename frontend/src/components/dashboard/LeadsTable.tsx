import React, { useMemo, useState, useEffect } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { LEAD_API } from "../../config/api.config";
import "../../styles/dashboard.css";

// Backend Lead interface from the API
interface BackendLead {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  status: "Open" | "Closed" | "Ongoing" | "Pending";
  type: "Hot" | "Warm" | "Cold";
  language: string;
  location: string;
  receivedDate: string;
  assignedEmployee?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Interface for dashboard table display
interface DashboardLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  assignedTo: string;
  status: "Active" | "Inactive";
  priority: "Hot" | "Warm" | "Cold";
}

interface LeadsTableProps {
  data?: DashboardLead[];
  refreshKey?: number;
}

const columnHelper = createColumnHelper<DashboardLead>();

export const LeadsTable: React.FC<LeadsTableProps> = ({ data, refreshKey }) => {
  const [leads, setLeads] = useState<DashboardLead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRecentLeads, setTotalRecentLeads] = useState<number>(0);

  // Function to map backend lead to dashboard lead format
  const mapBackendLeadToDashboard = (
    backendLead: BackendLead
  ): DashboardLead => {
    return {
      id: backendLead._id,
      name: backendLead.name,
      email: backendLead.email || "No email",
      phone: backendLead.phone || "No phone",
      assignedTo: backendLead.assignedEmployee
        ? `${backendLead.assignedEmployee.firstName} ${backendLead.assignedEmployee.lastName}`
        : "Unassigned",
      status: backendLead.status === "Closed" ? "Inactive" : "Active",
      priority: backendLead.type,
    };
  };

  // Function to fetch leads from backend
  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use the new recent leads API endpoint - always request 10 leads
      const response = await axios.get(`${LEAD_API}/recent`, {
        params: {
          limit: 10, // Always request exactly 10 leads
          days: 7, // Prefer leads from last 7 days, but backfill if needed
        },
      });

      if (response.data && response.data.status === "success") {
        const responseData = response.data;
        setTotalRecentLeads(responseData.totalRecentLeads || 0);

        if (responseData.data && responseData.data.leads) {
          const backendLeads: BackendLead[] = responseData.data.leads;
          const dashboardLeads = backendLeads.map(mapBackendLeadToDashboard);
          setLeads(dashboardLeads);
        } else {
          setLeads([]);
        }
      } else {
        setLeads([]);
        setTotalRecentLeads(0);
      }
    } catch (error: any) {
      console.error("Failed to fetch recent leads:", error);
      const errorMessage =
        error?.response?.data?.message || "Failed to load leads data";
      setError(errorMessage);
      setLeads([]);
      setTotalRecentLeads(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch leads on component mount and when refreshKey changes
  useEffect(() => {
    fetchLeads();
  }, [refreshKey]);

  // Use provided data if available, otherwise use fetched data
  const tableData = data && data.length > 0 ? data : leads;

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => {
          const value = info.getValue();
          const email = info.row.original.email;

          return (
            <div className="user-info">
              <div className="user-avatar">{value.charAt(0).toUpperCase()}</div>
              <div className="user-details">
                <h4>{value}</h4>
                <p>{email}</p>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("phone", {
        header: "Phone#",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("assignedTo", {
        header: "Assigned Lead",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("status", {
        header: "Status Lead",
        cell: (info) => (
          <span className={`status-badge ${info.getValue().toLowerCase()}`}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("priority", {
        header: "Priority",
        cell: (info) => (
          <span className={`status-badge ${info.getValue().toLowerCase()}`}>
            {info.getValue()}
          </span>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="table-section">
      <div className="table-header">
        <h3 className="table-title">
          Latest 10 Leads
          {!isLoading && leads.length > 0 && (
            <span
              style={{
                fontWeight: "normal",
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              {" "}
              • {totalRecentLeads > 0 && `${totalRecentLeads} from last 7 days`}
            </span>
          )}
        </h3>
        {isLoading && <span className="loading-indicator">Loading...</span>}
        {error && <span className="error-indicator">{error}</span>}
      </div>

      {isLoading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
          Loading leads data...
        </div>
      ) : error ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}>
          {error}
        </div>
      ) : tableData.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
          No leads available
        </div>
      ) : (
        <table className="data-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
