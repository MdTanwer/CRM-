import React from "react";
import type { DashboardStats } from "../../data/dummyData";
import "../../styles/dashboard.css";

interface StatsCardsProps {
  stats: DashboardStats[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="stats-grid">
      {stats.map((stat) => (
        <div key={stat.id} className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-info">
              <p>{stat.title}</p>
              <h3>{stat.value}</h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
