import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { CSVUploadModal } from "../components/leads/CSVUploadModal";
import { LeadsTable } from "../components/leads/LeadsTable";
import axios from "axios";
import { toast } from "react-toastify";
import { FaUpload } from "react-icons/fa";
import "../styles/dashboard.css";
import "../styles/leads.css";
import "../styles/leadsupload.css";

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

const PAGE_SIZE = 10;

export const LeadsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPage =
    location.pathname === "/" ? "dashboard" : location.pathname.slice(1);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLeads = useCallback(
    async (page: number = 0) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get("http://localhost:3000/api/v1/leads", {
          params: {
            page: page + 1, // API uses 1-based indexing
            limit: PAGE_SIZE,
            search: searchTerm || undefined,
          },
        });

        setLeads(response.data.data.leads);
        setTotalLeads(response.data.totalLeads);
        setPageCount(response.data.totalPages);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch leads");
        toast.error("Error loading leads");
        console.error("Error fetching leads:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [searchTerm]
  );

  // Fetch leads when component mounts or when refreshKey changes
  useEffect(() => {
    fetchLeads(pageIndex);
  }, [fetchLeads, pageIndex, refreshKey]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPageIndex(0); // Reset to first page
    fetchLeads(0);
  };

  // Handle edit lead
  const handleEditLead = (leadId: string) => {
    // Navigate to edit lead page or open edit modal
    navigate(`/leads/edit/${leadId}`);
  };

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} />

      <div className="main-content">
        {/* Custom Leads Header */}
        <div className="header">
          <div className="lead-header-actions">
            <form
              className="lead-search-container"
              onSubmit={handleSearchSubmit}
            >
              <input
                type="text"
                placeholder="Search leads by name, email..."
                className="search-input"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <button type="submit" className="search-button">
                Search
              </button>
            </form>
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
                className="add-lead-btn"
                onClick={() => setIsUploadModalOpen(true)}
              >
                Add Lead
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="loading-spinner">Loading leads...</div>
          ) : error ? (
            <div className="error-message">Error: {error}</div>
          ) : leads.length === 0 ? (
            <div className="no-data-message">
              No leads found. Import leads or add a new lead to get started.
            </div>
          ) : (
            <LeadsTable
              data={leads}
              pageCount={pageCount}
              pageIndex={pageIndex}
              onPageChange={setPageIndex}
              onDataChange={() => {
                // Refresh the leads list by incrementing refreshKey
                setRefreshKey((prevKey) => prevKey + 1);
              }}
              onEditLead={handleEditLead}
            />
          )}
        </div>
      </div>

      {isUploadModalOpen && (
        <CSVUploadModal onClose={() => setIsUploadModalOpen(false)} />
      )}
    </div>
  );
};
