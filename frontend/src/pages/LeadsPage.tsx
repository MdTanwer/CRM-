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
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);

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

  // Handle search input change with debouncing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      setPageIndex(0); // Reset to first page when searching
      fetchLeads(0);
    }, 500); // 500ms delay

    setSearchTimeout(timeout);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} />

      <div className="main-content">
        {/* Custom Leads Header */}

        <div className="emp-header">
          <div className="emp-header-actions">
            <div className="emp-search-container">
              <input
                type="text"
                placeholder="Search employees by name, ID..."
                className="emp-search-input"
                value={searchTerm}
                onChange={handleSearchChange}
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
                className="add-leads-btn3"
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
