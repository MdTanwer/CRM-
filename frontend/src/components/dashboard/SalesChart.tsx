import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { salesAnalyticsData } from "../../data/dummyData";
import "../../styles/dashboard.css";
import axios from "axios";
import { LEAD_API } from "../../config/api.config";

interface SalesData {
  date: string;
  day: string;
  value: number;
  dailySales: number;
  dailyLeads: number;
  isToday: boolean;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
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
          {`${data.day} (${data.date})`}
        </p>
        <p style={{ margin: 0, color: "#3b82f6" }}>
          {`Total Sales: ${data.value}`}
        </p>
        <p style={{ margin: 0, color: "#10b981" }}>
          {`Daily Sales: ${data.dailySales}`}
        </p>
        <p style={{ margin: 0, color: "#6b7280" }}>
          {`Daily Leads: ${data.dailyLeads}`}
        </p>
      </div>
    );
  }
  return null;
};

export const SalesChart: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [maxValue, setMaxValue] = useState<number>(60);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${LEAD_API}/sales-analytics`);

        if (
          response.data &&
          response.data.data &&
          response.data.data.salesAnalytics
        ) {
          const data = response.data.data.salesAnalytics;
          setSalesData(data);

          // Calculate max value for Y-axis with some padding
          const maxDataValue = Math.max(
            ...data.map((item: SalesData) => item.value)
          );
          setMaxValue(Math.ceil(maxDataValue * 1.2)); // 20% padding
        }
      } catch (error) {
        console.error("Failed to fetch sales analytics data:", error);
        setError("Failed to load sales data");
        // Fallback to dummy data
        setSalesData(
          salesAnalyticsData.map((item, index) => ({
            date: `2023-${index + 1}-01`,
            day: item.day,
            value: item.value,
            dailySales: Math.round(item.value / 3),
            dailyLeads: Math.round(item.value / 2),
            isToday: index === salesAnalyticsData.length - 1,
          }))
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  return (
    <div className="chart-section">
      <div className="chart-header">
        <h3 className="chart-title">Sales Analytics</h3>
        {isLoading && <span className="loading-indicator">Loading...</span>}
        {error && <span className="error-indicator">{error}</span>}
      </div>
      <div
        className="chart-content"
        style={{ padding: "20px", height: "320px", background: "#ffffff" }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={salesData.length > 0 ? salesData : salesAnalyticsData}
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
              domain={[0, maxValue]}
              ticks={Array.from({ length: 6 }, (_, i) =>
                Math.round((maxValue * i) / 5)
              )}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              name="Total Sales"
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
