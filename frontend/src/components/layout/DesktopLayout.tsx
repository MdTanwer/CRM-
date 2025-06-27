import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import "./DesktopLayout.css";

export const DesktopLayout: React.FC = () => {
  const location = useLocation();
  const currentPage =
    location.pathname === "/" ? "dashboard" : location.pathname.slice(1);

  return (
    <div className="desktop-layout">
      {/* Sticky Sidebar */}
      <div className="desktop-sidebar">
        <Sidebar currentPage={currentPage} />
      </div>

      {/* Main Content Area */}
      <div className="desktop-main">
        {/* Sticky Header */}
        <div className="desktop-header">
          <Header currentPage={currentPage} />
        </div>

        {/* Scrollable Content */}
        <div className="desktop-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
