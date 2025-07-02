import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

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
}

const PAGE_SIZE = 10;

export const LeadsTable: React.FC<LeadsTableProps> = ({
  data,
  pageCount,
  pageIndex,
  onPageChange,
}) => {
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
        header: ({ column }) => {
          return (
            <div
              className="lead-column-header"
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
        enableSorting: true,
      },

      {
        accessorKey: "status",
        header: ({ column }) => {
          return (
            <div
              className="lead-column-header"
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
            className={`lead-status-badge ${getStatusBadgeClass(getValue())}`}
          >
            {getValue()}
          </span>
        ),
        size: 100,
        enableSorting: true,
      },
      {
        accessorKey: "location",
        header: ({ column }) => {
          return (
            <div
              className="lead-column-header"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <span>Location</span>
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
        size: 120,
        enableSorting: true,
      },
      {
        accessorKey: "language",
        header: ({ column }) => {
          return (
            <div
              className="lead-column-header"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <span>Language</span>
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
        size: 120,
        enableSorting: true,
      },
      {
        accessorKey: "receivedDate",
        header: ({ column }) => {
          return (
            <div
              className="lead-column-header"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <span>Received Date</span>
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
        cell: ({ getValue }) => <span>{formatDate(getValue() as string)}</span>,
        size: 150,
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          const dateA = new Date(rowA.original.receivedDate);
          const dateB = new Date(rowB.original.receivedDate);
          return dateA.getTime() - dateB.getTime();
        },
      },
      {
        id: "assignedTo",
        header: ({ column }) => {
          return (
            <div
              className="lead-column-header"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <span>Assigned To</span>
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
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          const nameA = rowA.original.assignedEmployee
            ? `${rowA.original.assignedEmployee.firstName} ${rowA.original.assignedEmployee.lastName}`
            : "Unassigned";
          const nameB = rowB.original.assignedEmployee
            ? `${rowB.original.assignedEmployee.firstName} ${rowB.original.assignedEmployee.lastName}`
            : "Unassigned";
          return nameA.localeCompare(nameB);
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
          {(() => {
            const pages = [];
            const currentPage = pageIndex + 1; // Convert to 1-based
            const totalPages = pageCount;

            // Always show first page if not in current view
            if (currentPage > 3) {
              pages.push(
                <button
                  key={0}
                  className={`leads-pagination-page${
                    pageIndex === 0 ? " active" : ""
                  }`}
                  onClick={() => onPageChange(0)}
                >
                  1
                </button>
              );

              // Show ellipsis if there's a gap
              if (currentPage > 4) {
                pages.push(
                  <span
                    key="ellipsis-start"
                    className="leads-pagination-ellipsis"
                  >
                    ...
                  </span>
                );
              }
            }

            // Show current page and surrounding pages (3 pages total)
            const startPage = Math.max(
              0,
              Math.min(pageIndex - 1, totalPages - 3)
            );
            const endPage = Math.min(startPage + 3, totalPages);

            for (let i = startPage; i < endPage; i++) {
              pages.push(
                <button
                  key={i}
                  className={`leads-pagination-page${
                    pageIndex === i ? " active" : ""
                  }`}
                  onClick={() => onPageChange(i)}
                >
                  {i + 1}
                </button>
              );
            }

            // Show ellipsis and last page if not in current view
            if (currentPage < totalPages - 2) {
              // Show ellipsis if there's a gap
              if (currentPage < totalPages - 3) {
                pages.push(
                  <span
                    key="ellipsis-end"
                    className="leads-pagination-ellipsis"
                  >
                    ...
                  </span>
                );
              }

              // Always show last page
              pages.push(
                <button
                  key={totalPages - 1}
                  className={`leads-pagination-page${
                    pageIndex === totalPages - 1 ? " active" : ""
                  }`}
                  onClick={() => onPageChange(totalPages - 1)}
                >
                  {totalPages}
                </button>
              );
            }

            return pages;
          })()}
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
