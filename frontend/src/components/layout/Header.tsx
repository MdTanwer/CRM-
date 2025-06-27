import React from "react";
import "../../styles/dashboard.css";

interface HeaderProps {
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ currentPage }) => {
  return (
    <div className="header">
      <div className="breadcrumb">
        <span>Home</span>
        <span>&gt;</span>
        <span style={{ color: "#1f2937", fontWeight: "500" }}>
          {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
        </span>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search here..."
          className="search-input"
        />
        <div className="search-icon">🔍</div>
      </div>
    </div>
  );
};
