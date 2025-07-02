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
import {
  getTotalLeadsCount,
  getClosedLeadsCount,
  getAssignedLeadsCount,
  getUnassignedLeadsCount,
} from "../services/leads.service";

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
  const [assignedLeadsCount, setAssignedLeadsCount] = useState<number>(0);
  const [totalLeadsCount, setTotalLeadsCount] = useState<number>(0);
  const [closedLeadsCount, setClosedLeadsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataRefreshKey, setDataRefreshKey] = useState<number>(0);

  // Fetch all lead counts using service functions
  const fetchAllCounts = async () => {
    try {
      const [unassignedRes, assignedRes, totalRes, closedRes] =
        await Promise.all([
          getUnassignedLeadsCount(),
          getAssignedLeadsCount(),
          getTotalLeadsCount(),
          getClosedLeadsCount(),
        ]);

      // Handle unassigned leads count
      if (unassignedRes?.data?.unassignedLeadsCount !== undefined) {
        setUnassignedLeadsCount(unassignedRes.data.unassignedLeadsCount);
      } else {
        setUnassignedLeadsCount(0);
      }

      // Handle assigned leads count
      if (assignedRes?.data?.assignedLeadsCount !== undefined) {
        setAssignedLeadsCount(assignedRes.data.assignedLeadsCount);
      } else {
        setAssignedLeadsCount(0);
      }

      // Handle total leads count
      if (totalRes?.data?.totalLeadsCount !== undefined) {
        setTotalLeadsCount(totalRes.data.totalLeadsCount);
      } else {
        setTotalLeadsCount(0);
      }

      // Handle closed leads count
      if (closedRes?.data?.closedLeadsCount !== undefined) {
        setClosedLeadsCount(closedRes.data.closedLeadsCount);
      } else {
        setClosedLeadsCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch lead counts:", error);
      setUnassignedLeadsCount(0);
      setAssignedLeadsCount(0);
      setTotalLeadsCount(0);
      setClosedLeadsCount(0);
    }
  };

  // Function to refresh all dashboard data
  const refreshDashboardData = () => {
    setIsLoading(true);

    const fetchData = async () => {
      try {
        await fetchAllCounts();
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
        setDataRefreshKey((prevKey) => prevKey + 1);
      }
    };

    fetchData();
  };

  useEffect(() => {
    setIsLoading(true);

    const fetchData = async () => {
      try {
        await fetchAllCounts();
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      refreshDashboardData();
    }, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  // Update stats whenever counts change
  useEffect(() => {
    // Calculate conversion rate using real API data
    const conversionRate =
      assignedLeadsCount > 0
        ? Math.round((closedLeadsCount / assignedLeadsCount) * 100)
        : 0;

    // Count active salespeople
    const activeSalespeople = employeesData.filter(
      (emp) => emp.status === "Active"
    ).length;

    // Create dynamic stats using API data
    const dynamicStats: DashboardStats[] = [
      {
        id: "1",
        title: "Unassigned Leads",
        value: isLoading ? "Loading..." : `${unassignedLeadsCount}`,
        icon: <FaMoneyBills size={25} />,
      },
      {
        id: "2",
        title: "Assigned Leads",
        value: isLoading ? "Loading..." : `${assignedLeadsCount}`,
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
  }, [
    unassignedLeadsCount,
    assignedLeadsCount,
    totalLeadsCount,
    closedLeadsCount,
    isLoading,
  ]);

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
