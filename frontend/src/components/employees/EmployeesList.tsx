import React, { useEffect, useState } from "react";
import axios from "axios";

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  preferredLanguage: string;
  assignedLeads: number;
  closedLeads: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const EmployeesList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Direct API call to ensure we're getting the correct data
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          "http://localhost:3000/api/v1/employees"
        );
        console.log("API Response:", response.data);

        if (response.data && Array.isArray(response.data.data?.employees)) {
          setEmployees(response.data.data.employees);
        } else {
          setEmployees([]);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching employees:", err);
        setError("Failed to fetch employees. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  if (isLoading) {
    return <div>Loading employees...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (employees.length === 0) {
    return <div>No employees found.</div>;
  }

  return (
    <div className="employees-list">
      <h2>Employees ({employees.length})</h2>

      <div className="employees-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Location</th>
              <th>Assigned Leads</th>
              <th>Closed Leads</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee._id}>
                <td>{`${employee.firstName} ${employee.lastName}`}</td>
                <td>{employee.email}</td>
                <td>{employee.location}</td>
                <td>{employee.assignedLeads}</td>
                <td>{employee.closedLeads}</td>
                <td>
                  <span className={`status-badge status-${employee.status}`}>
                    {employee.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination would be implemented here if needed */}
    </div>
  );
};
