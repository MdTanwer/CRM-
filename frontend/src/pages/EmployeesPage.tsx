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
  location: string;
  preferredLanguage: string;
  assignedLeads: number;
  closedLeads: number;
  status: string;
  avatarUrl?: string;
}

const PAGE_SIZE = 5;

export const EmployeesPage: React.FC = () => {
  const location = useLocation();
  const currentPage =
    location.pathname === "/" ? "dashboard" : location.pathname.slice(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchEmployees = useCallback(async (page: number, search?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = {
        page: page + 1,
        limit: PAGE_SIZE,
      };

      // Add search parameter if provided
      if (search && search.trim()) {
        params.search = search.trim();
      }

      const response = await axios.get(
        "http://localhost:3000/api/v1/employees",
        { params }
      );

      const apiData = response.data.data?.employees || [];
      const totalEmployees =
        response.data.totalEmployees || response.data.data?.totalEmployees || 0;
      setPageCount(Math.ceil(totalEmployees / PAGE_SIZE));

      const formattedEmployees = apiData.map((emp: any) => ({
        _id: emp._id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        employeeId: emp.employeeId || "",
        location: emp.location || "",
        preferredLanguage: emp.preferredLanguage || "",
        assignedLeads: emp.assignedLeads || 0,
        closedLeads: emp.closedLeads || 0,
        status: emp.status || "",
        avatarUrl: undefined,
      }));

      setEmployees(formattedEmployees);
    } catch (err) {
      setError("Failed to fetch employees. Please try again later.");
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees(pageIndex, searchTerm);
  }, [fetchEmployees, pageIndex, refreshKey, searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    setPageIndex(0); // Reset to first page when searching
  };

  const handleAddEmployee = () => {
    setCurrentEmployee(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditEmployee = (employeeId: string) => {
    const employee = employees.find((emp) => emp._id === employeeId);
    if (employee) {
      console.log("Employee to edit:", employee);
      setCurrentEmployee(employee);
      setIsEditing(true);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentEmployee(null);
    setIsEditing(false);
  };

  const handleSaveEmployee = async (employeeData: any) => {
    try {
      if (isEditing && currentEmployee) {
        const response = await axios.patch(
          `http://localhost:3000/api/v1/employees/${currentEmployee._id}`,
          employeeData
        );

        toast.success("Employee updated successfully!");
      } else {
        // Create new employee

        const response = await axios.post(
          "http://localhost:3000/api/v1/employees",
          employeeData
        );
        toast.success("Employee added successfully!");
      }

      // Close the modal and refresh the list
      setIsModalOpen(false);
      setCurrentEmployee(null);
      setIsEditing(false);
      setRefreshKey((prevKey) => prevKey + 1); // Increment to force refresh
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        `Failed to ${
          isEditing ? "update" : "create"
        } employee. Please try again.`;
      toast.error(msg);
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
                className="emp-search-input"
                value={searchTerm}
                onChange={handleSearchChange}
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
              onDataChange={() => {
                // Refresh the employee list by incrementing refreshKey
                setRefreshKey((prevKey) => prevKey + 1);
              }}
              onEditEmployee={handleEditEmployee}
            />
          )}
        </div>
      </div>

      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEmployee}
        employee={currentEmployee}
        isEditing={isEditing}
      />
    </div>
  );
};
