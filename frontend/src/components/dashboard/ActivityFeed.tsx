import React from "react";
import type { RecentActivity } from "../../data/dummyData";
import "../../styles/dashboard.css";

interface ActivityFeedProps {
  activities: RecentActivity[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  return (
    <div className="activity-section">
      <div className="activity-header">
        <h3 className="activity-title">Recent Activity Feed</h3>
      </div>
      <div className="activity-list">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-item">
            <div className="activity-dot"></div>
            <p className="activity-text">{activity.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
