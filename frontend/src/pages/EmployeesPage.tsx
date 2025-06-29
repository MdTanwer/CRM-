import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { EmployeesTable } from "../components/employees/EmployeesTable";
import { AddEmployeeModal } from "../components/employees/AddEmployeeModal";
import { employeesData } from "../data/dummyData";
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
