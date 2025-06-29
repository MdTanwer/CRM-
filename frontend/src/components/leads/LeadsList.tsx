import React, { useEffect } from "react";
import { useLeads } from "../../context";

export const LeadsList: React.FC = () => {
  const {
    leads,
    isLoading,
    error,
    getLeads,
    totalLeads,
    currentPage,
    totalPages,
  } = useLeads();

  useEffect(() => {
    // Load leads when the component mounts
    getLeads(1);
  }, [getLeads]);

  if (isLoading) {
    return <div>Loading leads...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (leads.length === 0) {
    return <div>No leads found.</div>;
  }

  return (
    <div className="leads-list">
      <h2>Leads ({totalLeads})</h2>

      <div className="leads-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Type</th>
              <th>Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>{lead.contactName}</td>
                <td>{lead.email}</td>
                <td>
                  <span className={`status-badge status-${lead.status}`}>
                    {lead.status}
                  </span>
                </td>
                <td>
                  <span className={`type-badge type-${lead.type}`}>
                    {lead.type}
                  </span>
                </td>
                <td>{lead.assignedToName || "Unassigned"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => getLeads(currentPage - 1)}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => getLeads(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
