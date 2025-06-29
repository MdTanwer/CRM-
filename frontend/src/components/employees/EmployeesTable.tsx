import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { FaEllipsisV } from "react-icons/fa";
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
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const PAGE_SIZE = 7;

export const EmployeesTable: React.FC<EmployeesTableProps> = ({
  data,
  pageCount,
  pageIndex,
  onPageChange,
}) => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const columns = useMemo<ColumnDef<Employee, any>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        size: 40,
      },
      {
        accessorKey: "firstName",
        header: "Name",
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
      },
      {
        accessorKey: "employeeId",
        header: "Employee ID",
        cell: ({ getValue }) => <span className="emp-id">{getValue()}</span>,
        size: 120,
      },
      {
        accessorKey: "assignedLeads",
        header: "Assigned Leads",
        cell: ({ getValue }) => <span>{getValue()}</span>,
        size: 80,
      },
      {
        accessorKey: "closedLeads",
        header: "Closed Leads",
        cell: ({ getValue }) => <span>{getValue()}</span>,
        size: 80,
      },
      {
        accessorKey: "status",
        header: "Status",
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
      },
      {
        id: "actions",
        header: "",
        cell: () => (
          <button className="emp-action-btn">
            <FaEllipsisV />
          </button>
        ),
        size: 40,
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      pagination: { pageIndex, pageSize: PAGE_SIZE },
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount,
  });

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
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={pageIndex === 0}
        >
          &lt; Previous
        </button>
        <span className="emp-pagination-pages">
          <button className="emp-pagination-page active">
            {pageIndex + 1}
          </button>
        </span>
        <button
          className="emp-pagination-btn"
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={pageIndex === pageCount - 1}
        >
          Next &gt;
        </button>
      </div>
    </div>
  );
};
