import React, { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { AddEmployeeModal } from "../components/employees/AddEmployeeModal";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/employees.css";
import { EmployeesTable } from "../components/employees/EmployeesTable";

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  assignedLeads: number;
  closedLeads: number;
  status: string;
  avatarUrl?: string;
}

const PAGE_SIZE = 7;

export const EmployeesPage: React.FC = () => {
  const location = useLocation();
  const currentPage =
    location.pathname === "/" ? "dashboard" : location.pathname.slice(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Used to force refresh the employee list
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  const fetchEmployees = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        "http://localhost:3000/api/v1/employees",
        {
          params: { page: page + 1, limit: PAGE_SIZE },
        }
      );
      const apiData = response.data.data?.employees || [];
      const totalEmployees =
        response.data.totalEmployees || response.data.data?.totalEmployees || 0;
      setPageCount(Math.ceil(totalEmployees / PAGE_SIZE));
      setEmployees(
        apiData.map((emp: any) => ({
          _id: emp._id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          employeeId: emp.employeeId || "#23454GH6JY7T6", // Placeholder, replace with real if available
          assignedLeads: emp.assignedLeads || 0,
          closedLeads: emp.closedLeads || 0,
          status: emp.status || "active",
          avatarUrl: undefined, // You can add logic for avatar if available
        }))
      );
    } catch (err) {
      setError("Failed to fetch employees. Please try again later.");
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees(pageIndex);
  }, [fetchEmployees, pageIndex, refreshKey]);

  const handleAddEmployee = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveEmployee = async (employeeData: any) => {
    try {
      // Save employee to the API
      const response = await axios.post(
        "http://localhost:3000/api/v1/employees",
        employeeData
      );

      toast.success("Employee added successfully!");
      // Close the modal and refresh the list
      setIsModalOpen(false);
      setRefreshKey((prevKey) => prevKey + 1); // Increment to force refresh
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        "Failed to create employee. Please try again.";
      toast.error(msg);
      console.error("Error creating employee:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} />

      <div className="main-content">
        {/* Custom Employees Header */}
        <div className="emp-header">
          <div className="emp-header-actions">
            <div className="emp-search-container">
              <input
                type="text"
                placeholder="Search employees by name, ID..."
                className="search-input"
              />
            </div>
          </div>
        </div>

        <div className="employees-content">
          <div className="emp-content-container">
            <div className="emp-breadcrumbs">
              <span className="emp-breadcrumb-item">Home</span>
              <span className="emp-breadcrumb-separator">&gt;</span>
              <Link
                to="/employees"
                className="emp-breadcrumb-item"
                style={{ textDecoration: "none" }}
              >
                Employees
              </Link>
            </div>
            <div>
              <button className="emp-add-btn" onClick={handleAddEmployee}>
                Add Employees
              </button>
            </div>
          </div>
          <br />

          {isLoading ? (
            <div>Loading employees...</div>
          ) : error ? (
            <div>Error: {error}</div>
          ) : employees.length === 0 ? (
            <div>No employees found.</div>
          ) : (
            <EmployeesTable
              data={employees}
              pageCount={pageCount}
              pageIndex={pageIndex}
              onPageChange={setPageIndex}
            />
          )}
        </div>
      </div>

      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEmployee}
      />
    </div>
  );
};
