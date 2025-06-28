import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "../../constants";
import "../../styles/sidebar.css";

interface SidebarProps {
  currentPage: string;
}

const navigation = [
  {
    name: "Dashboard",
    href: ROUTES.ADMIN_DASHBOARD,
    id: "dashboard",
  },
  {
    name: "Leads",
    href: ROUTES.LEADS,
    id: "leads",
  },

  {
    name: "Employees",
    href: ROUTES.EMPLOYEES,
    id: "employees",
  },

  {
    name: "Settings",
    href: ROUTES.SETTINGS,
    id: "settings",
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPage }) => {
  const location = useLocation();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-logo">
          Caravan<span style={{ color: "#0003D0" }}>CRM</span>{" "}
        </h1>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {navigation.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href === ROUTES.ADMIN_DASHBOARD &&
                location.pathname === "/") ||
              currentPage === item.id;

            return (
              <li key={item.id}>
                <Link to={item.href} className={isActive ? "active" : ""}>
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
