import React, { useMemo, useState, useEffect } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { EMPLOYEE_API } from "../../config/api.config";
import "../../styles/dashboard.css";
import type { BackendEmployee, DashboardEmployee } from "../../types";

// Backend Employee interface from the API
// Interface for dashboard table display

interface EmployeesTableProps {
  data?: DashboardEmployee[];
  refreshKey?: number;
}

const columnHelper = createColumnHelper<DashboardEmployee>();

export const EmployeesTable: React.FC<EmployeesTableProps> = ({
  data,
  refreshKey,
}) => {
  const [employees, setEmployees] = useState<DashboardEmployee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRecentEmployees, setTotalRecentEmployees] = useState<number>(0);

  // Function to map backend employee to dashboard employee format
  const mapBackendEmployeeToDashboard = (
    backendEmployee: BackendEmployee
  ): DashboardEmployee => {
    return {
      id: backendEmployee._id,
      name: `${backendEmployee.firstName} ${backendEmployee.lastName}`,
      email: backendEmployee.email,
      employeeId: backendEmployee.employeeId,
      assignedLeads: backendEmployee.assignedLeads,
      closedLeads: backendEmployee.closedLeads,
      status: backendEmployee.status === "active" ? "Active" : "Inactive",
      image: backendEmployee.avatarUrl,
    };
  };

  // Function to fetch employees from backend
  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use the new recent employees API endpoint - always request 10 employees
      const response = await axios.get(`${EMPLOYEE_API}/recent`, {
        params: {
          limit: 10, // Always request exactly 10 employees
          days: 7, // Prefer employees from last 7 days, but backfill if needed
        },
      });

      if (response.data && response.data.status === "success") {
        const responseData = response.data;
        setTotalRecentEmployees(responseData.totalRecentEmployees || 0);

        if (responseData.data && responseData.data.employees) {
          const backendEmployees: BackendEmployee[] =
            responseData.data.employees;
          const dashboardEmployees = backendEmployees.map(
            mapBackendEmployeeToDashboard
          );
          setEmployees(dashboardEmployees);
        } else {
          setEmployees([]);
        }
      } else {
        setEmployees([]);
        setTotalRecentEmployees(0);
      }
    } catch (error: any) {
      console.error("Failed to fetch recent employees:", error);
      const errorMessage =
        error?.response?.data?.message || "Failed to load employees data";
      setError(errorMessage);
      setEmployees([]);
      setTotalRecentEmployees(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch employees on component mount and when refreshKey changes
  useEffect(() => {
    fetchEmployees();
  }, [refreshKey]);

  // Use provided data if available, otherwise use fetched data
  const tableData = data && data.length > 0 ? data : employees;

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => {
          const value = info.getValue();
          const email = info.row.original.email;
          const image = info.row.original.image;

          return (
            <div className="user-info">
              <div className="user-avatar">
                {image ? (
                  <img
                    src={image}
                    alt={value}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const imgElement = e.target as HTMLImageElement;
                      const fallbackDiv =
                        imgElement.parentElement?.querySelector(
                          '[data-fallback="true"]'
                        ) as HTMLElement;
                      if (fallbackDiv) {
                        imgElement.style.display = "none";
                        fallbackDiv.style.display = "flex";
                      }
                    }}
                  />
                ) : null}
                <div
                  data-fallback="true"
                  style={{
                    display: image ? "none" : "flex",
                    width: "40px",
                    height: "40px",
                    backgroundColor: "#f3f4f6",
                    borderRadius: "50%",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  {value.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="user-details">
                <h4>{value}</h4>
                <p>{email}</p>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("employeeId", {
        header: "Employee ID",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("assignedLeads", {
        header: "Assigned Leads",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("closedLeads", {
        header: "Closed Leads",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("status", {
        header: "Status",
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
        <h3 className="table-title">Recent Employees</h3>
        {isLoading && <span className="loading-indicator">Loading...</span>}
        {error && <span className="error-indicator">{error}</span>}
      </div>

      {isLoading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
          Loading employees data...
        </div>
      ) : error ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}>
          {error}
        </div>
      ) : tableData.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
          No employees available
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

// Backward compatibility export
export const LeadsTable = EmployeesTable;
