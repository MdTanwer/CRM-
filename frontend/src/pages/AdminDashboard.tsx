import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { StatsCards } from "../components/dashboard/StatsCards";
import { SalesChart } from "../components/dashboard/SalesChart";
import { ActivityFeed } from "../components/dashboard/ActivityFeed";
import { LeadsTable } from "../components/dashboard/LeadsTable";
import { dashboardStats, recentActivity, leadsData } from "../data/dummyData";
import "../styles/dashboard.css";

export const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const currentPage =
    location.pathname === "/" ? "dashboard" : location.pathname.slice(1);

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
          <StatsCards stats={dashboardStats} />

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
