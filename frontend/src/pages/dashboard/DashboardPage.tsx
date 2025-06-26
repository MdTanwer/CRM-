import React from "react";
import { DashboardStatsCards } from "../../components/features/dashboard/DashboardStats";
import type { DashboardStats } from "../../types";

// Mock data - replace with actual API calls
const mockStats: DashboardStats = {
  unassignedLeads: 24,
  leadsAssignedThisWeek: 156,
  activeSalespeople: 12,
  conversionRate: 23.4,
  totalLeads: 342,
  closedLeads: 78,
  totalRevenue: 125000,
  avgDealValue: 1603,
};

const mockActivities = [
  {
    id: "1",
    userId: "1",
    userName: "Jay Wilson",
    type: "deal_closed" as const,
    description: "Jay closed a deal worth $2,500",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: "2",
    userId: "2",
    userName: "Sarah Johnson",
    type: "lead_assigned" as const,
    description: "Sarah was assigned 5 new leads",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
  },
  {
    id: "3",
    userId: "3",
    userName: "Mike Chen",
    type: "call_scheduled" as const,
    description: "Mike scheduled a follow-up call",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
  },
];

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back! Here's what's happening with your sales team.
        </p>
      </div>

      {/* Stats Cards */}
      <DashboardStatsCards stats={mockStats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Activity
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {activity.userName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View all activity →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Quick Actions
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                Add New Lead
              </button>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                Schedule Call
              </button>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors">
                Add Employee
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors">
                Upload Leads (CSV)
              </button>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Today's Schedule
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-md">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Call with John Doe
                    </p>
                    <p className="text-xs text-gray-500">
                      10:00 AM - Cold Call
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-yellow-200 text-yellow-800 rounded">
                    Upcoming
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Demo with Jane Smith
                    </p>
                    <p className="text-xs text-gray-500">
                      2:00 PM - Product Demo
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-blue-200 text-blue-800 rounded">
                    Scheduled
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View full schedule →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Sales Performance
          </h2>
        </div>
        <div className="p-6">
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4"></div>
              <p className="text-gray-500">Chart placeholder</p>
              <p className="text-sm text-gray-400">
                Interactive conversion rate chart will be displayed here
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
