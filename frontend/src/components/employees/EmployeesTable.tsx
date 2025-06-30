import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  getSortedRowModel,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  RowSelectionState,
  SortingState,
} from "@tanstack/react-table";
import {
  FaEllipsisV,
  FaEdit,
  FaTrash,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import "../../styles/employees.css";

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  assignedLeads: number;
  closedLeads: number;
  status: string;
  avatarUrl?: string;
}

interface EmployeesTableProps {
  data: Employee[];
  pageCount: number;
  pageIndex: number;
  onPageChange: (page: number) => void;
  onDataChange?: () => void;
  onEditEmployee?: (employeeId: string) => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export const EmployeesTable: React.FC<EmployeesTableProps> = ({
  data,
  pageCount,
  pageIndex,
  onPageChange,
  onDataChange,
  onEditEmployee,
}) => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  const handleEditEmployee = (employeeId: string) => {
    if (onEditEmployee) {
      onEditEmployee(employeeId);
    }
    setActiveMenu(null);
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      setIsDeleting(true);
      // Call the delete API
      await axios.delete(
        `http://localhost:3000/api/v1/employees/${employeeId}`
      );

      // Show success message
      toast.success("Employee deleted successfully");

      // Refresh the data
      if (onDataChange) {
        onDataChange();
      }
    } catch (error: any) {
      // Show error message
      const errorMsg =
        error?.response?.data?.message || "Failed to delete employee";
      toast.error(errorMsg);
      console.error("Error deleting employee:", error);
    } finally {
      setIsDeleting(false);
      setActiveMenu(null);
    }
  };

  const toggleMenu = (employeeId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the click from bubbling up
    setActiveMenu(activeMenu === employeeId ? null : employeeId);
  };

  const columns = useMemo<ColumnDef<Employee, any>[]>(
    () => [
      {
        id: "name",
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        header: ({ column }) => {
          return (
            <div
              className="emp-column-header"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <span>Name</span>
              {column.getIsSorted() === "asc" ? (
                <FaSortUp className="sort-icon" />
              ) : column.getIsSorted() === "desc" ? (
                <FaSortDown className="sort-icon" />
              ) : (
                <FaSort className="sort-icon" />
              )}
            </div>
          );
        },
        cell: ({ row }) => {
          const emp = row.original;
          return (
            <div className="emp-cell-name">
              {emp.avatarUrl ? (
                <img
                  src={emp.avatarUrl}
                  alt={emp.firstName}
                  className="emp-avatar"
                />
              ) : (
                <div className="emp-avatar-placeholder">
                  {getInitials(emp.firstName + " " + emp.lastName)}
                </div>
              )}
              <div className="emp-name-email">
                <div className="emp-name">
                  {emp.firstName} {emp.lastName}
                </div>
                <div className="emp-email">{emp.email}</div>
              </div>
            </div>
          );
        },
        size: 220,
        enableSorting: true,
      },
      {
        accessorKey: "employeeId",
        header: ({ column }) => {
          return (
            <div
              className="emp-column-header"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <span>Employee ID</span>
              {column.getIsSorted() === "asc" ? (
                <FaSortUp className="sort-icon" />
              ) : column.getIsSorted() === "desc" ? (
                <FaSortDown className="sort-icon" />
              ) : (
                <FaSort className="sort-icon" />
              )}
            </div>
          );
        },
        cell: ({ getValue }) => <span className="emp-id">{getValue()}</span>,
        size: 120,
        enableSorting: true,
      },
      {
        accessorKey: "assignedLeads",
        header: ({ column }) => {
          return (
            <div
              className="emp-column-header"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <span>Assigned Leads</span>
              {column.getIsSorted() === "asc" ? (
                <FaSortUp className="sort-icon" />
              ) : column.getIsSorted() === "desc" ? (
                <FaSortDown className="sort-icon" />
              ) : (
                <FaSort className="sort-icon" />
              )}
            </div>
          );
        },
        cell: ({ getValue }) => <span>{getValue()}</span>,
        size: 80,
        enableSorting: true,
      },
      {
        accessorKey: "closedLeads",
        header: ({ column }) => {
          return (
            <div
              className="emp-column-header"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <span>Closed Leads</span>
              {column.getIsSorted() === "asc" ? (
                <FaSortUp className="sort-icon" />
              ) : column.getIsSorted() === "desc" ? (
                <FaSortDown className="sort-icon" />
              ) : (
                <FaSort className="sort-icon" />
              )}
            </div>
          );
        },
        cell: ({ getValue }) => <span>{getValue()}</span>,
        size: 80,
        enableSorting: true,
      },
      {
        accessorKey: "status",
        header: ({ column }) => {
          return (
            <div
              className="emp-column-header"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <span>Status</span>
              {column.getIsSorted() === "asc" ? (
                <FaSortUp className="sort-icon" />
              ) : column.getIsSorted() === "desc" ? (
                <FaSortDown className="sort-icon" />
              ) : (
                <FaSort className="sort-icon" />
              )}
            </div>
          );
        },
        cell: ({ getValue }) => (
          <span
            className={`emp-status-badge ${
              getValue() === "active" ? "active" : "inactive"
            }`}
          >
            <span
              className="emp-status-dot"
              style={{
                background: getValue() === "active" ? "#22C55E" : "#F87171",
              }}
            />
            {getValue() === "active" ? "Active" : "Inactive"}
          </span>
        ),
        size: 80,
        enableSorting: true,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="emp-action-menu">
            <button
              className="emp-action-btn"
              onClick={(e) => toggleMenu(row.original._id, e)}
            >
              <FaEllipsisV />
            </button>
            {activeMenu === row.original._id && (
              <div
                className="emp-action-tooltip"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="emp-tooltip-btn"
                  onClick={() => handleEditEmployee(row.original._id)}
                >
                  <FaEdit /> <span>Edit</span>
                </button>
                <button
                  className="emp-tooltip-btn emp-delete-btn"
                  onClick={() => handleDeleteEmployee(row.original._id)}
                  disabled={isDeleting}
                >
                  <FaTrash />{" "}
                  <span>{isDeleting ? "Deleting..." : "Delete"}</span>
                </button>
              </div>
            )}
          </div>
        ),
        size: 40,
        enableSorting: false,
      },
    ],
    [activeMenu, isDeleting]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      sorting,
    },
    enableSorting: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
    manualSorting: false,
    pageCount: Math.ceil(data.length / 5),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 5,
      },
    },
    debugTable: false,
  });

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setActiveMenu(null);
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="emp-table-wrapper">
      <table className="emp-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} style={{ width: header.getSize() }}>
                  {flexRender(
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
            <tr key={row.id} className={row.getIsSelected() ? "selected" : ""}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="emp-table-pagination">
        <button
          className="emp-pagination-btn"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          &lt; Previous
        </button>
        <span className="emp-pagination-pages">
          {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map(
            (pageNumber) => {
              // Only show first 10 pages to avoid UI overflow
              if (pageNumber <= 10 && pageNumber <= table.getPageCount()) {
                return (
                  <button
                    key={pageNumber}
                    className={`emp-pagination-page${
                      table.getState().pagination.pageIndex === pageNumber - 1
                        ? " active"
                        : ""
                    }`}
                    onClick={() => table.setPageIndex(pageNumber - 1)}
                  >
                    {pageNumber}
                  </button>
                );
              }
              return null;
            }
          )}
        </span>
        <button
          className="emp-pagination-btn"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next &gt;
        </button>
      </div>
    </div>
  );
};
