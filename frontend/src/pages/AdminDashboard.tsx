import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { StatsCards } from "../components/dashboard/StatsCards";
import { SalesChart } from "../components/dashboard/SalesChart";
import { ActivityFeed } from "../components/dashboard/ActivityFeed";
import { LeadsTable } from "../components/dashboard/LeadsTable";
import {
  dashboardStats,
  recentActivity,
  leadsData,
  employeesData,
} from "../data/dummyData";
import type { DashboardStats } from "../data/dummyData";
import "../styles/dashboard.css";
import {
  FaMoneyBills,
  FaUser,
  FaHandshake,
  FaGaugeHigh,
} from "react-icons/fa6";

export const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const currentPage =
    location.pathname === "/" ? "dashboard" : location.pathname.slice(1);

  const [stats, setStats] = useState<DashboardStats[]>([]);

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
        title: "Upcoming Calls",
        value: "12", // This will be dynamic in the future
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
  }, []);

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} />

      <div className="main-content">
        {/* Custom Dashboard Header */}
        <div className="header">
          <div className="header-actions">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search leads, employees..."
                className="search-input"
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
            <SalesChart />

            {/* Activity Feed */}
            <ActivityFeed activities={recentActivity} />
          </div>

          {/* Leads Table */}
          <LeadsTable data={leadsData} />
        </div>
      </div>
    </div>
  );
};
