import React, { useState } from "react";
import "../../styles/employees.css";
import { CiWarning } from "react-icons/ci";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employeeData: any) => void;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    location: "",
    preferredLanguage: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      location: "",
      preferredLanguage: "",
    });
    onClose();
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
          <h2>Add New Employee</h2>
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
                <option value="">Kamlodan</option>
                <option value="kamlodan">Kamlodan</option>
                <option value="kolkata">Kolkata</option>
                <option value="mumbai">Mumbai</option>
                <option value="delhi">Delhi</option>
                <option value="bangalore">Bangalore</option>
              </select>
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
                <option value="">Hindi</option>
                <option value="hindi">Hindi</option>
                <option value="english">English</option>
                <option value="bengali">Bengali</option>
                <option value="tamil">Tamil</option>
                <option value="telugu">Telugu</option>
              </select>
            </div>
            <div className="form-help-tooltip">
              <span className="tooltip-icon">
                {" "}
                <CiWarning />
              </span>
              <span className="tooltip-text">
                Lead will be assigned on biases on language
              </span>
            </div>
          </div>

          <div className="emp-modal-actions">
            <button type="submit" className="emp-save-btn">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
