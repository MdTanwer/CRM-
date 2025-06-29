import React, { useState, useEffect } from "react";
import "../../styles/employees.css";
import { CiWarning } from "react-icons/ci";

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId?: string;
  location?: string;
  preferredLanguage?: string;
  assignedLeads?: number;
  closedLeads?: number;
  status: string;
  avatarUrl?: string;
}

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employeeData: any) => void;
  employee: Employee | null;
  isEditing: boolean;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employee,
  isEditing,
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    location: "",
    preferredLanguage: "",
    status: "active", // Default status
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when employee prop changes (for editing)
  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName || "",
        lastName: employee.lastName || "",
        email: employee.email || "",
        location: employee.location || "",
        preferredLanguage: employee.preferredLanguage || "",
        status: employee.status || "active",
      });
    } else {
      // Reset form when adding a new employee
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        location: "",
        preferredLanguage: "",
        status: "active",
      });
    }
  }, [employee]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.location) {
      newErrors.location = "Location is required";
    }

    if (!formData.preferredLanguage) {
      newErrors.preferredLanguage = "Preferred language is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="emp-modal-overlay" onClick={handleOverlayClick}>
      <div className="emp-add-employee-modal">
        <div className="emp-modal-header">
          <h2>{isEditing ? "Edit Employee" : "Add New Employee"}</h2>
          <button className="emp-modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="employee-form">
          <div className="form-group">
            <label htmlFor="firstName">First name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Sutirtho"
              required
            />
            {errors.firstName && (
              <div className="error-message">{errors.firstName}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Pal"
              required
            />
            {errors.lastName && (
              <div className="error-message">{errors.lastName}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Sutirthopal@gmail.com"
              required
            />
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>

          <div className="form-field-container">
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              >
                <option value="">Select location</option>
                <option value="pune">Pune</option>
                <option value="hyderabad">Hyderabad</option>
                <option value="delhi">Delhi</option>
              </select>
              {errors.location && (
                <div className="error-message">{errors.location}</div>
              )}
            </div>
            <div className="form-help-tooltip">
              <span className="tooltip-icon">
                <CiWarning />
              </span>
              <span className="tooltip-text">
                Lead will be assigned on biases on location
              </span>
            </div>
          </div>

          <div className="form-field-container">
            <div className="form-group">
              <label htmlFor="preferredLanguage">Preferred Language</label>
              <select
                id="preferredLanguage"
                name="preferredLanguage"
                value={formData.preferredLanguage}
                onChange={handleInputChange}
                required
              >
                <option value="">Select language</option>
                <option value="hindi">Hindi</option>
                <option value="english">English</option>
                <option value="bengali">Bengali</option>
                <option value="tamil">Tamil</option>
              </select>
              {errors.preferredLanguage && (
                <div className="error-message">{errors.preferredLanguage}</div>
              )}
            </div>
            <div className="form-help-tooltip">
              <span className="tooltip-icon">
                <CiWarning />
              </span>
              <span className="tooltip-text">
                Lead will be assigned on biases on language
              </span>
            </div>
          </div>

          <div className="form-field-container">
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="emp-modal-actions">
            <button type="submit" className="emp-save-btn">
              {isEditing ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
