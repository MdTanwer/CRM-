import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { EmployeesList } from "../components/employees/EmployeesList";
import { AddEmployeeModal } from "../components/employees/AddEmployeeModal";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/employees.css";

export const EmployeesPage: React.FC = () => {
  const location = useLocation();
  const currentPage =
    location.pathname === "/" ? "dashboard" : location.pathname.slice(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Used to force refresh the employee list

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

          {/* Key prop forces the component to remount when an employee is added */}
          <EmployeesList key={refreshKey} />
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
