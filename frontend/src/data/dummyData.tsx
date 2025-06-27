import React from "react";
import type { ReactElement } from "react";
import {
  FaHandshake,
  FaMoneyBills,
  FaUser,
  FaChartLine,
  FaGaugeHigh,
} from "react-icons/fa6";

export interface DashboardStats {
  id: string;
  title: string;
  value: string;
  icon: ReactElement | string;
}

export interface RecentActivity {
  id: string;
  message: string;
  timeAgo: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  assignedTo: string;
  status: "Active" | "Inactive";
  priority: "Hot" | "Warm" | "Cold";
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  assignedLeads: number;
  closedLeads: number;
  status: "Active" | "Inactive";
}

export const dashboardStats: DashboardStats[] = [
  {
    id: "1",
    title: "Upcoming Calls",
    value: "12",
    icon: <FaMoneyBills size={25} />,
  },
  {
    id: "2",
    title: "Assigned This Week",
    value: "2k",
    icon: <FaUser size={25} />,
  },
  {
    id: "3",
    title: "Active SalesPerson",
    value: "5",
    icon: <FaHandshake size={25} />,
  },
  {
    id: "4",
    title: "Conversion Rate",
    value: "22%",
    icon: <FaGaugeHigh size={25} />,
  },
];

export const recentActivity: RecentActivity[] = [
  {
    id: "1",
    message: "You assigned a lead to Priya - 1 hour ago",
    timeAgo: "1 hour ago",
  },
  {
    id: "2",
    message: "Jay added a deal - 2 hours ago",
    timeAgo: "2 hours ago",
  },
];

export const salesAnalyticsData = [
  { day: "Sat", value: 20 },
  { day: "Sun", value: 35 },
  { day: "Mon", value: 20 },
  { day: "Tue", value: 12 },
  { day: "Wed", value: 5 },
  { day: "Thu", value: 18 },
  { day: "Fri", value: 25 },
  { day: "Sat", value: 60 },
  { day: "Sun", value: 48 },
  { day: "Mon", value: 35 },
  { day: "Tue", value: 18 },
  { day: "Wed", value: 25 },
  { day: "Thu", value: 22 },
  { day: "Fri", value: 8 },
];

export const leadsData: Lead[] = [
  {
    id: "1",
    name: "Tamar Freda",
    email: "tamar.freda@gmail.com",
    phone: "4234456780/78",
    assignedTo: "Jay",
    status: "Active",
    priority: "Hot",
  },
  {
    id: "2",
    name: "Evette Winson",
    email: "evette.winson@gmail.com",
    phone: "4234456780/78",
    assignedTo: "Jay",
    status: "Active",
    priority: "Warm",
  },
  {
    id: "3",
    name: "Evette Winson",
    email: "evette.winson@gmail.com",
    phone: "4234456780/78",
    assignedTo: "Jay",
    status: "Active",
    priority: "Cold",
  },
  {
    id: "4",
    name: "Taxy Owek",
    email: "taxy.owek@gmail.com",
    phone: "4234456780/78",
    assignedTo: "Jay",
    status: "Active",
    priority: "Hot",
  },
];

export const employeesData: Employee[] = [
  {
    id: "1",
    name: "Tamar Freda",
    email: "tamar.freda@gmail.com",
    employeeId: "4234456780/78",
    assignedLeads: 3,
    closedLeads: 2,
    status: "Active",
  },
  {
    id: "2",
    name: "Edwin Winsør",
    email: "edwin.winsor@gmail.com",
    employeeId: "4234456780/78",
    assignedLeads: 3,
    closedLeads: 1,
    status: "Active",
  },
  {
    id: "3",
    name: "Taisy Sheth",
    email: "taisy.sheth@gmail.com",
    employeeId: "4234456780/78",
    assignedLeads: 2,
    closedLeads: 0,
    status: "Inactive",
  },
  {
    id: "4",
    name: "Jenna Mante",
    email: "jenna.mante@gmail.com",
    employeeId: "4234456780/78",
    assignedLeads: 2,
    closedLeads: 0,
    status: "Inactive",
  },
  {
    id: "5",
    name: "Edwin Winsør",
    email: "edwin.winsor@gmail.com",
    employeeId: "4234456780/78",
    assignedLeads: 4,
    closedLeads: 0,
    status: "Inactive",
  },
  {
    id: "6",
    name: "Taisy Sheth",
    email: "taisy.sheth@gmail.com",
    employeeId: "4234456780/78",
    assignedLeads: 8,
    closedLeads: 1,
    status: "Active",
  },
  {
    id: "7",
    name: "Jenna Mante",
    email: "jenna.mante@gmail.com",
    employeeId: "4234456780/78",
    assignedLeads: 5,
    closedLeads: 1,
    status: "Active",
  },
  {
    id: "8",
    name: "Edwin Winsør",
    email: "edwin.winsor@gmail.com",
    employeeId: "4234456780/78",
    assignedLeads: 4,
    closedLeads: 0,
    status: "Inactive",
  },
];
