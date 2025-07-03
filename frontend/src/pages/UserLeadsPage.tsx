import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/user-leads.css";
import { MdLocationOn } from "react-icons/md";
import { HiPencilAlt } from "react-icons/hi";
import { IoTime } from "react-icons/io5";
import { useAuth } from "../context/AuthContext";
import "../styles/user-leads.css";
import {
  getMyLeads,
  updateLeadStatus,
  updateLeadType,
  scheduleCall as scheduleLeadCall,
  canLeadBeClosed,
  getLeadSchedules,
  getEmployeeScheduleForDate,
  isTimeSlotAvailable,
} from "../services/leads.service";
import type { Lead as LeadType } from "../types";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { BottomNavigation } from "../components/BottomNavigation";
import { FaAngleLeft } from "react-icons/fa";
import { CiLocationOn } from "react-icons/ci";

export const UserLeadsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterTooltip, setShowFilterTooltip] = useState(false);
  const [filterValue, setFilterValue] = useState("All");
  const [statusFilterValue, setStatusFilterValue] = useState("All");
  const filterTooltipRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const [leads, setLeads] = useState<LeadType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leadsWithSchedules, setLeadsWithSchedules] = useState<Set<string>>(
    new Set()
  );

  // Type tooltip state
  const [showTypeTooltip, setShowTypeTooltip] = useState(false);
  const [activeLead, setActiveLead] = useState<string | null>(null);
  const typeTooltipRef = useRef<HTMLDivElement>(null);
  const typeButtonRef = useRef<HTMLButtonElement | null>(null);

  // DateTime tooltip state
  const [showDateTimeTooltip, setShowDateTimeTooltip] = useState(false);
  const [activeDateTimeLead, setActiveDateTimeLead] = useState<string | null>(
    null
  );
  const [dateValue, setDateValue] = useState("");
  const [timeValue, setTimeValue] = useState("");
  const [occupiedTimeSlots, setOccupiedTimeSlots] = useState<any[]>([]);
  const dateTimeTooltipRef = useRef<HTMLDivElement>(null);
  const dateTimeButtonRef = useRef<HTMLButtonElement | null>(null);

  // Status tooltip state
  const [showStatusTooltip, setShowStatusTooltip] = useState(false);
  const [activeStatusLead, setActiveStatusLead] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<
    "Open" | "Closed" | "Ongoing" | "Pending"
  >("Ongoing");

  const statusTooltipRef = useRef<HTMLDivElement>(null);
  const statusButtonRef = useRef<HTMLButtonElement | null>(null);

  // Get dynamic greeting based on time of day

  // Format date function
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  // Fetch leads for the logged-in user
  const fetchLeads = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      // Prepare search parameters
      const searchParams: {
        query?: string;
        type?: string;
        status?: string;
      } = {};

      if (searchQuery) {
        searchParams.query = searchQuery;
      }

      if (filterValue !== "All") {
        searchParams.type = filterValue;
      }

      if (statusFilterValue !== "All") {
        searchParams.status = statusFilterValue;
      }

      const data = await getMyLeads(token, searchParams);
      setLeads(data.data.leads);

      // Check for scheduled calls for each lead
      const schedulePromises = data.data.leads.map(async (lead: LeadType) => {
        try {
          const scheduleData = await getLeadSchedules(token, lead._id);
          return {
            leadId: lead._id,
            hasFutureSchedules: scheduleData.hasFutureSchedules,
          };
        } catch (error) {
          // If there's an error getting schedules, assume no schedules
          return {
            leadId: lead._id,
            hasFutureSchedules: false,
          };
        }
      });

      const scheduleResults = await Promise.all(schedulePromises);
      const newLeadsWithSchedules = new Set<string>();

      scheduleResults.forEach((result: any) => {
        if (result.hasFutureSchedules) {
          newLeadsWithSchedules.add(result.leadId);
        }
      });

      setLeadsWithSchedules(newLeadsWithSchedules);
      setError(null);
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError("Failed to load leads. Please try again.");
      toast.error("Failed to load leads. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [token, navigate]);

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
      case "ongoing":
        return "status-ongoing";
      case "closed":
        return "status-closed";
      case "unassigned":
      case "pending":
        return "status-pending";
      default:
        return "status-ongoing";
    }
  };

  const toggleFilterTooltip = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowFilterTooltip(!showFilterTooltip);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    setFilterValue(e.target.value);
  };

  const handleStatusFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    e.stopPropagation();
    setStatusFilterValue(e.target.value);
  };

  const handleSaveFilter = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fetchLeads();
    setShowFilterTooltip(false);
  };

  const handleClearFilters = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFilterValue("All");
    setStatusFilterValue("All");
    // Trigger search if there was a previous filter applied
    fetchLeads();
  };

  // Add a click handler to close the tooltips when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Handle filter tooltip
      if (
        filterTooltipRef.current &&
        filterButtonRef.current &&
        !filterTooltipRef.current.contains(target) &&
        !filterButtonRef.current.contains(target) &&
        !target.closest(".leads-filter-select") &&
        !target.closest("option")
      ) {
        setShowFilterTooltip(false);
      }

      // Handle type tooltip
      if (
        typeTooltipRef.current &&
        typeButtonRef.current &&
        !typeTooltipRef.current.contains(target) &&
        !typeButtonRef.current.contains(target)
      ) {
        setShowTypeTooltip(false);
        setActiveLead(null);
      }

      // Handle date/time tooltip
      if (
        dateTimeTooltipRef.current &&
        dateTimeButtonRef.current &&
        !dateTimeTooltipRef.current.contains(target) &&
        !dateTimeButtonRef.current.contains(target)
      ) {
        setShowDateTimeTooltip(false);
        setActiveDateTimeLead(null);
      }

      // Handle status tooltip
      if (
        statusTooltipRef.current &&
        statusButtonRef.current &&
        !statusTooltipRef.current.contains(target) &&
        !statusButtonRef.current.contains(target)
      ) {
        setShowStatusTooltip(false);
        setActiveStatusLead(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleTypeTooltip = (e: React.MouseEvent, leadId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (activeLead === leadId && showTypeTooltip) {
      setShowTypeTooltip(false);
      setActiveLead(null);
    } else {
      setShowTypeTooltip(true);
      setActiveLead(leadId);
      // Store the current button as reference
      typeButtonRef.current = e.currentTarget as HTMLButtonElement;
    }
  };

  const handleTypeChange = async (
    leadId: string,
    type: "hot" | "warm" | "cold"
  ) => {
    if (!token) return;

    try {
      // Convert to capitalized format for backend
      const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);

      // Update lead type in the backend
      await updateLeadType(token, leadId, capitalizedType);

      // Update local state
      setLeads(
        leads.map((lead) =>
          lead._id === leadId ? { ...lead, type } : lead
        ) as LeadType[]
      );

      toast.success(`Lead type updated to ${type}`);
    } catch (error) {
      console.error("Error updating lead type:", error);
      toast.error("Failed to update lead type");
    }

    // Close tooltip after selection
    setShowTypeTooltip(false);
    setActiveLead(null);
  };

  const toggleDateTimeTooltip = (e: React.MouseEvent, leadId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (activeDateTimeLead === leadId && showDateTimeTooltip) {
      setShowDateTimeTooltip(false);
      setActiveDateTimeLead(null);
    } else {
      setShowDateTimeTooltip(true);
      setActiveDateTimeLead(leadId);
      // Store the current button as reference
      dateTimeButtonRef.current = e.currentTarget as HTMLButtonElement;
    }
  };

  // Handle date change and fetch occupied time slots
  const handleDateChange = async (newDate: string) => {
    setDateValue(newDate);
    setTimeValue(""); // Reset time when date changes

    if (newDate && token) {
      try {
        const scheduleData = await getEmployeeScheduleForDate(token, newDate);
        setOccupiedTimeSlots(scheduleData.occupiedTimeSlots || []);
      } catch (error) {
        console.error("Error fetching occupied time slots:", error);
        setOccupiedTimeSlots([]);
      }
    } else {
      setOccupiedTimeSlots([]);
    }
  };

  // Check if a time is occupied
  const isTimeOccupied = (time: string) => {
    return occupiedTimeSlots.some((slot) => slot.time === time);
  };

  // Get the lead name for occupied time
  const getOccupiedLeadName = (time: string) => {
    const slot = occupiedTimeSlots.find((slot) => slot.time === time);
    return slot ? slot.leadName : "";
  };

  const handleSaveDateTime = async (leadId: string) => {
    if (!token || !dateValue || !timeValue) {
      toast.error("Please provide both date and time");
      return;
    }

    try {
      // Check if the time slot is available
      const isAvailable = await isTimeSlotAvailable(
        token,
        dateValue,
        timeValue
      );

      if (!isAvailable) {
        // Get more details about the conflict
        const scheduleData = await getEmployeeScheduleForDate(token, dateValue);
        const conflictingSlot = scheduleData.occupiedTimeSlots.find(
          (slot: any) => slot.time === timeValue
        );

        if (conflictingSlot) {
          toast.error(
            `You already have a call scheduled at ${timeValue} on ${dateValue} with lead: ${conflictingSlot.leadName}. Please choose a different time.`,
            {
              autoClose: 8000,
            }
          );
        } else {
          toast.error(
            "This time slot is already occupied. Please choose a different time."
          );
        }
        return;
      }

      // Schedule call in the backend
      await scheduleLeadCall(token, leadId, dateValue, timeValue);

      // Add this lead to the scheduled leads set
      const newLeadsWithSchedules = new Set(leadsWithSchedules);
      newLeadsWithSchedules.add(leadId);
      setLeadsWithSchedules(newLeadsWithSchedules);

      toast.success("Call scheduled successfully");

      // Reset form
      setDateValue("");
      setTimeValue("");
    } catch (error: any) {
      console.error("Error scheduling call:", error);

      // Check if it's a scheduling conflict error from backend
      if (
        error.response?.data?.message?.includes("already have a call scheduled")
      ) {
        toast.error(error.response.data.message, {
          autoClose: 8000,
        });
      } else {
        toast.error("Failed to schedule call");
      }
    }

    // Close tooltip after saving
    setShowDateTimeTooltip(false);
    setActiveDateTimeLead(null);
  };

  const toggleStatusTooltip = (
    e: React.MouseEvent,
    leadId: string,
    currentStatus: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (activeStatusLead === leadId && showStatusTooltip) {
      setShowStatusTooltip(false);
      setActiveStatusLead(null);
    } else {
      setShowStatusTooltip(true);
      setActiveStatusLead(leadId);
      // Convert backend status to the format expected by the UI
      let uiStatus: "Open" | "Closed" | "Ongoing" | "Pending";
      switch (currentStatus.toLowerCase()) {
        case "ongoing":
          uiStatus = "Ongoing";
          break;
        case "closed":
          uiStatus = "Closed";
          break;
        case "unassigned":
          uiStatus = "Pending";
          break;
        default:
          uiStatus = "Open";
      }
      setSelectedStatus(uiStatus);
      // Store the current button as reference
      statusButtonRef.current = e.currentTarget as HTMLButtonElement;
    }
  };

  const handleSaveStatus = async (leadId: string) => {
    if (!token) return;

    // If trying to close the lead, check for future schedules first
    if (selectedStatus === "Closed") {
      try {
        const canClose = await canLeadBeClosed(token, leadId);

        if (!canClose) {
          // Get schedule details for better error message
          const scheduleData = await getLeadSchedules(token, leadId);
          const futureSchedules = scheduleData.futureSchedules;

          let scheduleMessage = "This lead has future scheduled calls:\n";
          futureSchedules.forEach((schedule: any) => {
            scheduleMessage += `• ${schedule.scheduledDate} at ${schedule.scheduledTime}\n`;
          });
          scheduleMessage +=
            "\nPlease complete or cancel these calls before closing the lead.";

          toast.error(scheduleMessage, {
            autoClose: 8000,
            style: { whiteSpace: "pre-line" },
          });

          // Close tooltip without saving
          setShowStatusTooltip(false);
          setActiveStatusLead(null);
          return;
        }
      } catch (error) {
        console.error("Error checking lead schedules:", error);
        toast.error("Error checking scheduled calls. Please try again.");
        return;
      }
    }

    try {
      // Update lead status in the backend
      await updateLeadStatus(token, leadId, selectedStatus);

      // Update local state with proper type handling
      setLeads(
        leads.map((lead) =>
          lead._id === leadId ? { ...lead, status: selectedStatus } : lead
        ) as LeadType[]
      );

      // If lead was closed, remove it from scheduled leads
      if (selectedStatus === "Closed") {
        const newLeadsWithSchedules = new Set(leadsWithSchedules);
        newLeadsWithSchedules.delete(leadId);
        setLeadsWithSchedules(newLeadsWithSchedules);
      }

      toast.success(`Lead status updated to ${selectedStatus}`);
    } catch (error: any) {
      console.error("Error updating lead status:", error);

      // Check if it's a schedule-related error from backend
      if (error.response?.data?.message?.includes("future scheduled calls")) {
        toast.error(error.response.data.message, {
          autoClose: 8000,
        });
      } else {
        toast.error("Failed to update lead status");
      }
    }

    // Close tooltip after saving
    setShowStatusTooltip(false);
    setActiveStatusLead(null);
  };

  return (
    <div className="user-leads-container">
      {/* Header with CanovasCRM branding */}
      <div className="profile-header">
        <div className="profile-brand-logo">
          Canova<span style={{ color: "#E8E000" }}>CRM</span>
        </div>
        <div className="profile-header-nav">
          <button className="profile-back-btn" onClick={() => navigate(-1)}>
            <FaAngleLeft />
            Leads
          </button>
        </div>
      </div>
      {/* Search Bar */}
      <div className="leads-search-container">
        <div className="leads-search-input-wrapper">
          <div
            style={{
              backgroundColor: "#f2f2f2",
              borderRadius: "12px",
              width: "80%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "5px 16px",
            }}
          >
            {/* background-color: #f2f2f2; */}
            <svg
              className="leads-search-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="leads-search-input"
            />
          </div>
          <div
            style={{
              width: "14%",
              backgroundColor: "#f2f2f2",
              borderRadius: "12px",
              padding: "5px 5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "10px",
            }}
          >
            <button
              className={`leads-filter-btn-inline ${
                filterValue !== "All" || statusFilterValue !== "All"
                  ? "leads-filter-active"
                  : ""
              }`}
              onClick={toggleFilterTooltip}
              type="button"
              ref={filterButtonRef}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="4" y1="21" x2="4" y2="14"></line>
                <line x1="4" y1="10" x2="4" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="3"></line>
                <line x1="20" y1="21" x2="20" y2="16"></line>
                <line x1="20" y1="12" x2="20" y2="3"></line>
                <line x1="1" y1="14" x2="7" y2="14"></line>
                <line x1="9" y1="8" x2="15" y2="8"></line>
                <line x1="17" y1="16" x2="23" y2="16"></line>
              </svg>
            </button>
          </div>
        </div>

        {showFilterTooltip && (
          <div className="leads-filter-tooltip" ref={filterTooltipRef}>
            <div className="leads-filter-tooltip-header">Filter</div>

            <div className="leads-filter-section">
              <div className="leads-filter-label">Type</div>
              <div className="leads-filter-dropdown">
                <div className="leads-filter-select-wrapper">
                  <select
                    value={filterValue}
                    onChange={handleFilterChange}
                    className="leads-filter-select"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="All">All Types</option>
                    <option value="hot">Hot</option>
                    <option value="warm">Warm</option>
                    <option value="cold">Cold</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              className="leads-filter-save-btn"
              onClick={handleSaveFilter}
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Leads List */}
      <div className="leads-list">
        {loading ? (
          <div className="leads-loading">Loading leads...</div>
        ) : error ? (
          <div className="leads-error">{error}</div>
        ) : leads.length === 0 ? (
          <div className="leads-empty">
            {searchQuery || filterValue !== "All" || statusFilterValue !== "All"
              ? "No leads match your search criteria"
              : "No leads assigned to you yet"}
          </div>
        ) : (
          leads.map((lead) => (
            <div key={lead._id} className="lead-card">
              <div className="lead-header">
                <div className="lead-info">
                  <h1 className="lead-name">{lead.name}</h1>
                  <p className="lead-email">{lead.email || "No email"}</p>
                </div>
                <div className="lead-status-circle">
                  <span
                    className={`lead-status-badge2 ${getStatusBadgeClass(
                      lead.status
                    )}`}
                  >
                    {lead.status}
                  </span>
                </div>
              </div>
              <div className="lead-info-container">
                <div className="lead-date-section">
                  <span className="lead-date-label">date</span>
                  <div className="lead-date-value">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="18"
                        rx="2"
                        ry="2"
                      ></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>{formatDate(lead.receivedDate)}</span>
                  </div>
                </div>

                <div className="lead-actions-row">
                  <button
                    className="action-btn type-btn"
                    onClick={(e) => toggleTypeTooltip(e, lead._id)}
                    title="Change Type"
                    ref={activeLead === lead._id ? typeButtonRef : null}
                  >
                    <HiPencilAlt />
                  </button>

                  {showTypeTooltip && activeLead === lead._id && (
                    <div className="type-tooltip" ref={typeTooltipRef}>
                      <div className="type-tooltip-header">Type</div>
                      <div className="type-options">
                        <button
                          className="type-option hot-option"
                          onClick={() => handleTypeChange(lead._id, "hot")}
                        >
                          Hot
                        </button>
                        <button
                          className="type-option warm-option"
                          onClick={() => handleTypeChange(lead._id, "warm")}
                        >
                          Warm
                        </button>
                        <button
                          className="type-option cold-option"
                          onClick={() => handleTypeChange(lead._id, "cold")}
                        >
                          Cold
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    className="action-btn datetime-btn"
                    onClick={(e) => toggleDateTimeTooltip(e, lead._id)}
                    title="Set Date & Time"
                    ref={
                      activeDateTimeLead === lead._id ? dateTimeButtonRef : null
                    }
                  >
                    <IoTime />
                  </button>

                  {showDateTimeTooltip && activeDateTimeLead === lead._id && (
                    <div className="datetime-tooltip" ref={dateTimeTooltipRef}>
                      <div className="datetime-tooltip-header">Date</div>
                      <input
                        type="date"
                        className="datetime-input"
                        value={dateValue}
                        onChange={(e) => handleDateChange(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                      />
                      <div className="datetime-tooltip-header">Time</div>
                      <input
                        type="time"
                        className={`datetime-input ${
                          timeValue && isTimeOccupied(timeValue)
                            ? "datetime-input-conflict"
                            : ""
                        }`}
                        value={timeValue}
                        onChange={(e) => setTimeValue(e.target.value)}
                      />
                      {timeValue && isTimeOccupied(timeValue) && (
                        <div className="datetime-conflict-warning">
                          ⚠️ Conflict: {getOccupiedLeadName(timeValue)}
                        </div>
                      )}
                      {occupiedTimeSlots.length > 0 && (
                        <div className="occupied-slots-info">
                          <div className="occupied-slots-header">
                            Occupied times:
                          </div>
                          <div className="occupied-slots-list">
                            {occupiedTimeSlots.map((slot, index) => (
                              <div key={index} className="occupied-slot">
                                {slot.time} - {slot.leadName}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <button
                        className="datetime-save-btn"
                        onClick={() => handleSaveDateTime(lead._id)}
                        disabled={!!(timeValue && isTimeOccupied(timeValue))}
                      >
                        Save
                      </button>
                    </div>
                  )}

                  <button
                    style={{
                      background: "none",
                      border: "none",
                      outline: "none",
                      padding: "2px",
                      color: "#4534dd",
                    }}
                    onClick={(e) =>
                      toggleStatusTooltip(e, lead._id, lead.status)
                    }
                    ref={activeStatusLead === lead._id ? statusButtonRef : null}
                  >
                    <CiLocationOn size={20} />
                  </button>

                  {showStatusTooltip && activeStatusLead === lead._id && (
                    <div className="status-tooltip" ref={statusTooltipRef}>
                      <div className="status-tooltip-header">Lead Status</div>
                      <div className="status-dropdown">
                        <select
                          value={selectedStatus}
                          onChange={(e) =>
                            setSelectedStatus(
                              e.target.value as
                                | "Open"
                                | "Closed"
                                | "Ongoing"
                                | "Pending"
                            )
                          }
                          className="status-select"
                        >
                          <option value="Ongoing">Ongoing</option>
                          <option value="Pending">Pending</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                      <button
                        className="status-save-btn"
                        onClick={() => handleSaveStatus(lead._id)}
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
