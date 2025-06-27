import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { LeadsTable } from "../components/leads/LeadsDataTable";
import { CSVUploadModal } from "../components/leads/CSVUploadModal";
import { leadsData } from "../data/dummyData";
import "../styles/dashboard.css";
import "../styles/leads.css";

export const LeadsPage: React.FC = () => {
  const location = useLocation();
  const currentPage =
    location.pathname === "/" ? "dashboard" : location.pathname.slice(1);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} />

      <div className="main-content">
        {/* Custom Leads Header */}
        <div className="header">
          <div className="breadcrumb">
            <span>Home</span>
            <span>&gt;</span>
            <span style={{ color: "#1f2937", fontWeight: "500" }}>
              Lead Management
            </span>
          </div>

          <div className="header-actions">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search leads by name, email..."
                className="search-input"
              />
              <div className="search-icon">🔍</div>
            </div>
            <button className="filter-btn">📋 Filter</button>
            <button
              className="add-leads-btn"
              onClick={() => setIsUploadModalOpen(true)}
            >
              📤 Add Leads
            </button>
          </div>
        </div>

        <div className="leads-content">
          <LeadsTable data={leadsData} />
        </div>
      </div>

      {isUploadModalOpen && (
        <CSVUploadModal onClose={() => setIsUploadModalOpen(false)} />
      )}
    </div>
  );
};
