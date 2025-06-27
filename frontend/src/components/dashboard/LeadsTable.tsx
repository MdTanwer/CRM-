import React, { useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { Lead } from "../../data/dummyData";
import "../../styles/dashboard.css";

interface LeadsTableProps {
  data: Lead[];
}

const columnHelper = createColumnHelper<Lead>();

export const LeadsTable: React.FC<LeadsTableProps> = ({ data }) => {
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
      columnHelper.display({
        id: "actions",
        header: "Action",
        cell: () => (
          <span
            style={{ color: "#10b981", cursor: "pointer", fontSize: "14px" }}
          >
            Active
          </span>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="table-section">
      <div className="table-header">
        <h3 className="table-title">Recent Leads</h3>
      </div>

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
    </div>
  );
};
