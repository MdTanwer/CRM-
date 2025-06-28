import React, { useState } from "react";
import { useLocation } from "react-router-dom";
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

            <button className="emp-add-btn" onClick={handleAddEmployee}>
              Add Employee
            </button>
          </div>
        </div>

        <div className="employees-content">
          <div className="emp-content-container">
            <div>yo</div>
            <div>hi</div>
          </div>
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
