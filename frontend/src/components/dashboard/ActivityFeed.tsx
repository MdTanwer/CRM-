import React, { useState, useEffect } from "react";
import { fetchAdminActivities } from "../../services/activities.service";
import type { Activity } from "../../services/activities.service";

interface ActivityFeedProps {
  className?: string;
  maxItems?: number;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  className = "",
  maxItems = 10,
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load activities on component mount
  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchAdminActivities();
      setActivities(data.slice(0, maxItems)); // Limit to maxItems
    } catch (err: any) {
      setError(err.message || "Failed to load activities");
      console.error("ActivityFeed error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Recent Activity Feed
        </h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center">
              <div className="w-1 h-1 bg-gray-300 rounded-full mr-3"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Recent Activity Feed
        </h3>
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm mb-2">{error}</p>
          <button
            onClick={loadActivities}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
    >
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Recent Activity Feed
      </h3>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No activities yet</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {activities.map((activity) => (
            <li key={activity.id} className="flex items-start">
              <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div className="text-sm text-gray-700 leading-relaxed">
                <span>{activity.message}</span>
                <span className="text-gray-500 ml-1">– {activity.timeAgo}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActivityFeed;
