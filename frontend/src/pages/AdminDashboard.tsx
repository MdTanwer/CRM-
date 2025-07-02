import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { StatsCards } from "../components/dashboard/StatsCards";
import { SalesChart } from "../components/dashboard/SalesChart";
import { ActivityFeed } from "../components/dashboard/ActivityFeed";
import { LeadsTable } from "../components/dashboard/LeadsTable";
import "../styles/dashboard.css";
import { dashboardStats, employeesData } from "../data/dummyData";
import type { DashboardStats } from "../data/dummyData";
import "../styles/dashboard.css";
import {
  FaMoneyBills,
  FaUser,
  FaHandshake,
  FaGaugeHigh,
} from "react-icons/fa6";
import axios from "axios";
import { LEAD_API } from "../config/api.config";

interface LeadStats {
  stats: { _id: string | null; count: number }[];
  typeStats: { _id: string; count: number }[];
  locationStats: { _id: string; count: number }[];
  languageStats: { _id: string; count: number }[];
}

export const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const currentPage = "dashboard";

  const [stats, setStats] = useState<DashboardStats[]>([]);
  const [unassignedLeadsCount, setUnassignedLeadsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataRefreshKey, setDataRefreshKey] = useState<number>(0);

  // Fetch unassigned leads count from the backend
  const fetchUnassignedLeads = async () => {
    try {
      // Use the new dedicated endpoint for unassigned leads count
      const response = await axios.get(`${LEAD_API}/unassigned/count`);

      if (
        response.data &&
        response.data.data &&
        response.data.data.unassignedLeadsCount !== undefined
      ) {
        setUnassignedLeadsCount(response.data.data.unassignedLeadsCount);
      } else {
        setUnassignedLeadsCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch unassigned leads count:", error);
      setUnassignedLeadsCount(0);
    }
  };

  // Fetch lead statistics from the backend
  const fetchLeadStats = async () => {
    try {
      const response = await axios.get<{ status: string; data: LeadStats }>(
        `${LEAD_API}/stats`
      );

      if (response.data && response.data.data) {
        // Stats fetched successfully, but we still need unassigned count from dedicated endpoint
        await fetchUnassignedLeads();
      }
    } catch (error) {
      console.error("Failed to fetch lead statistics:", error);
      // If stats fail, still try to get unassigned count
      await fetchUnassignedLeads();
    }
  };

  // Function to refresh all dashboard data
  const refreshDashboardData = () => {
    setIsLoading(true);

    // Fetch data from backend
    const fetchData = async () => {
      try {
        // Fetch both stats and unassigned leads count
        await Promise.all([
          fetchLeadStats().catch(console.error),
          fetchUnassignedLeads().catch(console.error),
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setUnassignedLeadsCount(0);
      } finally {
        setIsLoading(false);
        // Increment refresh key to trigger child component refreshes
        setDataRefreshKey((prevKey) => prevKey + 1);
      }
    };

    fetchData();
  };

  useEffect(() => {
    // Set loading state
    setIsLoading(true);

    // Fetch data from backend
    const fetchData = async () => {
      try {
        // Fetch both stats and unassigned leads count
        await Promise.all([
          fetchLeadStats().catch(console.error),
          fetchUnassignedLeads().catch(console.error),
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setUnassignedLeadsCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch data from backend
    fetchData();

    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      refreshDashboardData();
    }, 5 * 60 * 1000);

    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  // Update stats whenever unassignedLeadsCount or other values change
  useEffect(() => {
    // Calculate total leads and closed leads
    const totalLeads = employeesData.reduce(
      (sum, employee) => sum + employee.assignedLeads,
      0
    );
    const closedLeads = employeesData.reduce(
      (sum, employee) => sum + employee.closedLeads,
      0
    );

    // Calculate conversion rate
    const conversionRate =
      totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0;

    // Count active salespeople
    const activeSalespeople = employeesData.filter(
      (emp) => emp.status === "Active"
    ).length;

    // Create dynamic stats
    const dynamicStats: DashboardStats[] = [
      {
        id: "1",
        title: "Unassigned Leads",
        value: isLoading ? "Loading..." : `${unassignedLeadsCount}`,
        icon: <FaMoneyBills size={25} />,
      },
      {
        id: "2",
        title: "Assigned This Week",
        value: `${totalLeads}`,
        icon: <FaUser size={25} />,
      },
      {
        id: "3",
        title: "Active SalesPerson",
        value: `${activeSalespeople}`,
        icon: <FaHandshake size={25} />,
      },
      {
        id: "4",
        title: "Conversion Rate",
        value: `${conversionRate}%`,
        icon: <FaGaugeHigh size={25} />,
      },
    ];

    setStats(dynamicStats);
  }, [unassignedLeadsCount, isLoading]);

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} />

      <div className="main-content">
        {/* Custom Dashboard Header */}
        <div className="emp-header">
          <div className="emp-header-actions">
            <div className="emp-search-container">
              <input
                type="text"
                placeholder="Search employees by name, ID..."
                className="emp-search-input"
              />
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Breadcrumb Navigation */}
          <div className="breadcrumb-container">
            <div className="breadcrumb">
              <Link to="/" className="breadcrumb-item breadcrumb-link">
                Home
              </Link>
              <span className="breadcrumb-separator">&gt;</span>
              <span className="breadcrumb-item current">Dashboard</span>
            </div>
          </div>

          {/* Stats Cards */}
          <StatsCards stats={stats.length > 0 ? stats : dashboardStats} />

          {/* Two Column Layout */}
          <div className="dashboard-grid">
            {/* Sales Chart */}
            <SalesChart key={`sales-chart-${dataRefreshKey}`} />

            {/* Activity Feed - Now handles its own real-time data */}
            <ActivityFeed limit={5} />
          </div>

          {/* Leads Table */}
          <LeadsTable
            key={`leads-table-${dataRefreshKey}`}
            refreshKey={dataRefreshKey}
          />
        </div>
      </div>
    </div>
  );
};
