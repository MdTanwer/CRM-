import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { LeadsList } from "../components/leads/LeadsList";
import { CSVUploadModal } from "../components/leads/CSVUploadModal";
import { ROUTES } from "../constants";
import { FaUpload } from "react-icons/fa";
import "../styles/dashboard.css";
import "../styles/leads.css";
import "../styles/leadsupload.css";

export const LeadsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPage =
    location.pathname === "/" ? "dashboard" : location.pathname.slice(1);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} />

      <div className="main-content">
        {/* Custom Leads Header */}
        <div className="header">
          <div className="lead-header-actions">
            <div className="lead-search-container">
              <input
                type="text"
                placeholder="Search leads by name, email..."
                className="search-input"
              />
            </div>
          </div>
        </div>

        <div className="leads-content">
          <div className="emp-content-container">
            <div className="emp-breadcrumbs">
              <span className="emp-breadcrumb-item">Home</span>
              <span className="emp-breadcrumb-separator">&gt;</span>
              <Link
                to="/leads"
                className="emp-breadcrumb-item"
                style={{ textDecoration: "none" }}
              >
                Leads
              </Link>
            </div>
            <div className="leads-action-buttons">
              <button
                className="add-leads-btn"
                onClick={() => setIsUploadModalOpen(true)}
              >
                Add Lead
              </button>
            </div>
          </div>
          <LeadsList />
        </div>
      </div>

      {isUploadModalOpen && (
        <CSVUploadModal onClose={() => setIsUploadModalOpen(false)} />
      )}
    </div>
  );
};
