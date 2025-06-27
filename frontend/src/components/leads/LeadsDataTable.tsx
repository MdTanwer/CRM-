import React, { useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { Lead } from "../../data/dummyData";
import "../../styles/dashboard.css";
import "../../styles/leads.css";

interface LeadsDataTableProps {
  data: Lead[];
}

const columnHelper = createColumnHelper<Lead>();

export const LeadsTable: React.FC<LeadsDataTableProps> = ({ data }) => {
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "no",
        header: "No.",
        cell: (info) => (
          <span style={{ color: "#6b7280", fontSize: "14px" }}>
            {info.row.index + 1}
          </span>
        ),
      }),
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => (
          <span
            style={{ color: "#1f2937", fontSize: "14px", fontWeight: "500" }}
          >
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("email", {
        header: "Date",
        cell: () => (
          <span style={{ color: "#6b7280", fontSize: "14px" }}>04/09/2023</span>
        ),
      }),
      columnHelper.display({
        id: "noOfLeads",
        header: "No. of Leads",
        cell: () => (
          <span
            style={{ color: "#1f2937", fontSize: "14px", fontWeight: "500" }}
          >
            250
          </span>
        ),
      }),
      columnHelper.display({
        id: "assignedLeads",
        header: "Assigned Leads",
        cell: () => (
          <span
            style={{ color: "#1f2937", fontSize: "14px", fontWeight: "500" }}
          >
            213
          </span>
        ),
      }),
      columnHelper.display({
        id: "unassignedLeads",
        header: "Unassigned Leads",
        cell: () => (
          <span
            style={{ color: "#1f2937", fontSize: "14px", fontWeight: "500" }}
          >
            30
          </span>
        ),
      }),
      columnHelper.display({
        id: "closedLeads",
        header: "Closed Leads",
        cell: () => (
          <span
            style={{ color: "#1f2937", fontSize: "14px", fontWeight: "500" }}
          >
            7
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
  });

  return (
    <div className="leads-table-section">
      <table className="leads-data-table">
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
          {table
            .getRowModel()
            .rows.slice(0, 1)
            .map((row) => (
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
