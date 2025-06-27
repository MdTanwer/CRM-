import React, { useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";
import type { Employee } from "../../data/dummyData";
import "../../styles/dashboard.css";
import "../../styles/employees.css";

interface EmployeesTableProps {
  data: Employee[];
}

const columnHelper = createColumnHelper<Employee>();

export const EmployeesTable: React.FC<EmployeesTableProps> = ({ data }) => {
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "avatar",
        header: "",
        cell: (info) => (
          <div className="employee-avatar">
            <div className="avatar-circle">
              {info.row.original.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => (
          <div className="employee-info">
            <div className="employee-name">{info.getValue()}</div>
            <div className="employee-email">{info.row.original.email}</div>
          </div>
        ),
      }),
      columnHelper.accessor("employeeId", {
        header: "Employee ID",
        cell: (info) => <span className="employee-id">{info.getValue()}</span>,
      }),
      columnHelper.accessor("assignedLeads", {
        header: "Assigned Leads",
        cell: (info) => (
          <span className="assigned-leads">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("closedLeads", {
        header: "Closed Leads",
        cell: (info) => <span className="closed-leads">{info.getValue()}</span>,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <span className={`status-badge ${info.getValue().toLowerCase()}`}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: () => <button className="action-menu-btn">⋮</button>,
      }),
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="employees-table-section">
      <table className="employees-data-table">
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

      {/* Pagination */}
      <div className="table-pagination">
        <div className="pagination-info">
          <span>
            Showing{" "}
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}{" "}
            to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            of {table.getFilteredRowModel().rows.length} entries
          </span>
        </div>

        <div className="pagination-controls">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="pagination-btn"
          >
            Previous
          </button>

          <div className="page-numbers">
            {Array.from({ length: table.getPageCount() }, (_, i) => (
              <button
                key={i}
                onClick={() => table.setPageIndex(i)}
                className={`page-number ${
                  table.getState().pagination.pageIndex === i ? "active" : ""
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
