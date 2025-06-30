import React from "react";
import type { DashboardStats } from "../../data/dummyData";
import "../../styles/dashboard.css";

interface StatsCardsProps {
  stats: DashboardStats[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <>
      {/* Debug indicator */}

      <div
        className="stats-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          marginBottom: "32px",
        }}
      >
        {stats.map((stat, index) => {
          console.log(`Rendering stat ${index}:`, stat);
          return (
            <div
              key={stat.id}
              className="stat-card"
              style={{
                background: "#ffffff",
                borderRadius: "8px",
                padding: "20px",
                border: "1px solid #b1b1b1",
              }}
            >
              <div
                className="stat-card-content"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <div
                  className="stat-icon"
                  style={{
                    fontSize: "20px",
                    opacity: "0.7",
                    borderRadius: "50%",
                    padding: "8px",
                    backgroundColor: "#ececec",
                    color: "#616161",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {stat.icon}
                </div>
                <div className="stat-info">
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#616161",
                      margin: "0",
                      fontWeight: "500",
                    }}
                  >
                    {stat.title}
                  </p>
                  <h3
                    style={{
                      fontSize: "24px",
                      fontWeight: "600",
                      color: "#000000",
                      margin: "0 0 4px 0",
                    }}
                  >
                    {stat.value}
                  </h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
