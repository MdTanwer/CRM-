import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import { toast } from "react-toastify";
import "../../styles/leads.css";

interface Lead {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  type: string;
  language: string;
  location: string;
  receivedDate: string;
  assignedEmployee?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface LeadsTableProps {
  data: Lead[];
  pageCount: number;
  pageIndex: number;
  onPageChange: (page: number) => void;
  onDataChange?: () => void;
  onEditLead?: (leadId: string) => void;
}

const PAGE_SIZE = 10;

export const LeadsTable: React.FC<LeadsTableProps> = ({
  data,
  pageCount,
  pageIndex,
  onPageChange,
  onDataChange,
  onEditLead,
}) => {
  const handleEditLead = (leadId: string) => {
    if (onEditLead) {
      onEditLead(leadId);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      // Call the delete API
      await axios.delete(`http://localhost:3000/api/v1/leads/${leadId}`);

      // Show success message
      toast.success("Lead deleted successfully");

      // Refresh the data
      if (onDataChange) {
        onDataChange();
      }
    } catch (error: any) {
      // Show error message
      const errorMsg =
        error?.response?.data?.message || "Failed to delete lead";
      toast.error(errorMsg);
      console.error("Error deleting lead:", error);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "status-open";
      case "closed":
        return "status-closed";
      case "ongoing":
        return "status-ongoing";
      case "pending":
        return "status-pending";
      default:
        return "";
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type.toLowerCase()) {
      case "hot":
        return "type-hot";
      case "warm":
        return "type-warm";
      case "cold":
        return "type-cold";
      default:
        return "";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const columns = useMemo<ColumnDef<Lead, any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
          const lead = row.original;
          return (
            <div className="lead-cell-name">
              <div className="lead-name-details">
                <div className="lead-name">{lead.name}</div>
                <div className="lead-email">
                  {lead.email || lead.phone || "No contact info"}
                </div>
              </div>
            </div>
          );
        },
        size: 200,
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ getValue }) => (
          <span className={`lead-type-badge ${getTypeBadgeClass(getValue())}`}>
            {getValue()}
          </span>
        ),
        size: 100,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <span
            className={`lead-status-badge ${getStatusBadgeClass(getValue())}`}
          >
            {getValue()}
          </span>
        ),
        size: 100,
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ getValue }) => <span>{getValue()}</span>,
        size: 120,
      },
      {
        accessorKey: "language",
        header: "Language",
        cell: ({ getValue }) => <span>{getValue()}</span>,
        size: 120,
      },
      {
        accessorKey: "receivedDate",
        header: "Received Date",
        cell: ({ getValue }) => <span>{formatDate(getValue() as string)}</span>,
        size: 150,
      },
      {
        id: "assignedTo",
        header: "Assigned To",
        cell: ({ row }) => {
          const lead = row.original;
          return (
            <span>
              {lead.assignedEmployee
                ? `${lead.assignedEmployee.firstName} ${lead.assignedEmployee.lastName}`
                : "Unassigned"}
            </span>
          );
        },
        size: 150,
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount,
    state: {
      pagination: { pageIndex, pageSize: PAGE_SIZE },
    },
  });

  return (
    <div className="leads-table-wrapper">
      <table className="leads-table">
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

      <div className="leads-pagination">
        <button
          className="leads-pagination-btn"
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={pageIndex === 0}
        >
          &lt; Previous
        </button>
        <span className="leads-pagination-pages">
          {/* First page */}
          <button
            className={`leads-pagination-page${
              pageIndex === 0 ? " active" : ""
            }`}
            onClick={() => onPageChange(0)}
          >
            1
          </button>

          {/* Page 2 */}
          {pageCount > 1 && (
            <button
              className={`leads-pagination-page${
                pageIndex === 1 ? " active" : ""
              }`}
              onClick={() => onPageChange(1)}
            >
              2
            </button>
          )}

          {/* Page 3 */}
          {pageCount > 2 && (
            <button
              className={`leads-pagination-page${
                pageIndex === 2 ? " active" : ""
              }`}
              onClick={() => onPageChange(2)}
            >
              3
            </button>
          )}

          {/* Ellipsis */}
          {pageCount > 6 && (
            <span className="leads-pagination-ellipsis">...</span>
          )}

          {/* Last three pages if there are more than 6 pages */}
          {pageCount > 6 && (
            <>
              {/* Page totalPages-2 */}
              {pageCount > 5 && (
                <button
                  className={`leads-pagination-page${
                    pageIndex === pageCount - 3 ? " active" : ""
                  }`}
                  onClick={() => onPageChange(pageCount - 3)}
                >
                  {pageCount - 2}
                </button>
              )}

              {/* Page totalPages-1 */}
              {pageCount > 4 && (
                <button
                  className={`leads-pagination-page${
                    pageIndex === pageCount - 2 ? " active" : ""
                  }`}
                  onClick={() => onPageChange(pageCount - 2)}
                >
                  {pageCount - 1}
                </button>
              )}

              {/* Last page */}
              {pageCount > 3 && (
                <button
                  className={`leads-pagination-page${
                    pageIndex === pageCount - 1 ? " active" : ""
                  }`}
                  onClick={() => onPageChange(pageCount - 1)}
                >
                  {pageCount}
                </button>
              )}
            </>
          )}

          {/* Show pages 4, 5, 6 if total pages is 6 or less */}
          {pageCount <= 6 && pageCount > 3 && (
            <>
              {Array.from({ length: pageCount - 3 }, (_, i) => i + 3).map(
                (pageNumber) => (
                  <button
                    key={pageNumber}
                    className={`leads-pagination-page${
                      pageIndex === pageNumber - 1 ? " active" : ""
                    }`}
                    onClick={() => onPageChange(pageNumber - 1)}
                  >
                    {pageNumber}
                  </button>
                )
              )}
            </>
          )}
        </span>
        <button
          className="leads-pagination-btn"
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={pageIndex === pageCount - 1}
        >
          Next &gt;
        </button>
      </div>
    </div>
  );
};
