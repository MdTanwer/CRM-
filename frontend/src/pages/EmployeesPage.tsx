import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { EmployeesTable } from "../components/employees/EmployeesTable";
import { AddEmployeeModal } from "../components/employees/AddEmployeeModal";
import { employeesData } from "../data/dummyData";
import "../styles/dashboard.css";
import "../styles/employees.css";

export const EmployeesPage: React.FC = () => {
  const location = useLocation();
  const currentPage =
    location.pathname === "/" ? "dashboard" : location.pathname.slice(1);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddEmployee = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveEmployee = (employeeData: any) => {
    // Here you would typically save to your backend/state management
    console.log("New employee data:", employeeData);
    // For now, just close the modal
    setIsModalOpen(false);
  };

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} />

      <div className="main-content">
        {/* Custom Employees Header */}
        <div className="header">
          <div className="breadcrumb">
            <span>Home</span>
            <span>&gt;</span>
            <span style={{ color: "#1f2937", fontWeight: "500" }}>
              Employee Management
            </span>
          </div>

          <div className="header-actions">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search employees by name, ID..."
                className="search-input"
              />
              <div className="search-icon">🔍</div>
            </div>
            <button className="department-btn">🏢 Departments</button>
            <button className="add-employees-btn" onClick={handleAddEmployee}>
              👤 Add Employee
            </button>
          </div>
        </div>

        <div className="employees-content">
          <EmployeesTable data={employeesData} />
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
