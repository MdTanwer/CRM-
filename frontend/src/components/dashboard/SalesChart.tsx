import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { salesAnalyticsData } from "../../data/dummyData";
import "../../styles/dashboard.css";

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="custom-tooltip"
        style={{
          backgroundColor: "#ffffff",
          padding: "10px",
          border: "1px solid #e5e7eb",
          borderRadius: "6px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
      >
        <p style={{ margin: 0, fontWeight: "bold", color: "#1f2937" }}>
          {`${label}`}
        </p>
        <p style={{ margin: 0, color: "#3b82f6" }}>
          {`Quantity: ${payload[0].value}`}
        </p>
      </div>
    );
  }
  return null;
};

export const SalesChart: React.FC = () => {
  return (
    <div className="chart-section">
      <div className="chart-header">
        <h3 className="chart-title">Sales Analytics</h3>
      </div>
      <div
        className="chart-content"
        style={{ padding: "20px", height: "320px", background: "#ffffff" }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={salesAnalyticsData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              domain={[0, 60]}
              ticks={[0, 10, 20, 30, 40, 50, 60]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              fill="#d1d5db"
              stroke="#9ca3af"
              strokeWidth={1}
              radius={[2, 2, 0, 0]}
              className="chart-bar"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
