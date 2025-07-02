import React, { useState, useEffect, useRef } from "react";
import { CsvUpload } from "./CsvUpload";
import { FaTimes, FaUserPlus, FaFileUpload } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import "../../styles/addLeadModal.css";
import { LEAD_API } from "../../config/api.config";

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type TabType = "manual" | "csv";

export const AddLeadModal: React.FC<AddLeadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("manual");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    language: "",
    location: "",
    status: "Open",
    type: "Warm",
    receivedDate: new Date().toISOString().split("T")[0],
    assignedEmployee: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [distributionStrategy, setDistributionStrategy] =
    useState<string>("smart");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        language: "",
        location: "",
        status: "Open",
        type: "Warm",
        receivedDate: new Date().toISOString().split("T")[0],
        assignedEmployee: "",
      });
      setErrors({});
      setActiveTab("manual");
    }
  }, [isOpen]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email && !formData.phone) {
      newErrors.email = "Either email or phone is required";
      newErrors.phone = "Either email or phone is required";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.language) {
      newErrors.language = "Language is required";
    }

    if (!formData.location) {
      newErrors.location = "Location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        autoAssign: !formData.assignedEmployee,
      };

      const response = await axios.post(LEAD_API, payload);

      toast.success("Lead created successfully");

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error: any) {
      console.error("Error creating lead:", error);
      toast.error(error.response?.data?.message || "Failed to create lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    toast.success("CSV processed successfully");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="lead-modal-overlay">
      <div className="lead-modal-container" ref={modalRef}>
        <div className="lead-modal-header">
          <h2>Add New Lead</h2>
          <button className="lead-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="lead-modal-tabs">
          <button
            className={`lead-modal-tab ${
              activeTab === "manual" ? "active" : ""
            }`}
            onClick={() => handleTabChange("manual")}
          >
            <FaUserPlus /> Manual Entry
          </button>
          <button
            className={`lead-modal-tab ${activeTab === "csv" ? "active" : ""}`}
            onClick={() => handleTabChange("csv")}
          >
            <FaFileUpload /> CSV Upload
          </button>
        </div>

        <div className="lead-modal-content">
          {activeTab === "manual" ? (
            <form onSubmit={handleSubmit} className="lead-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Name*</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={errors.name ? "error" : ""}
                  />
                  {errors.name && (
                    <span className="error-message">{errors.name}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? "error" : ""}
                  />
                  {errors.email && (
                    <span className="error-message">{errors.email}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={errors.phone ? "error" : ""}
                  />
                  {errors.phone && (
                    <span className="error-message">{errors.phone}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="language">Language*</label>
                  <select
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className={errors.language ? "error" : ""}
                  >
                    <option value="">Select Language</option>
                    <option value="Hindi">Hindi</option>
                    <option value="English">English</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Tamil">Tamil</option>
                  </select>
                  {errors.language && (
                    <span className="error-message">{errors.language}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location*</label>
                  <select
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={errors.location ? "error" : ""}
                  >
                    <option value="">Select Location</option>
                    <option value="Pune">Pune</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Delhi">Delhi</option>
                  </select>
                  {errors.location && (
                    <span className="error-message">{errors.location}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Open">Open</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Pending">Pending</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="type">Type</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option value="Hot">Hot</option>
                    <option value="Warm">Warm</option>
                    <option value="Cold">Cold</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="receivedDate">Received Date</label>
                  <input
                    type="date"
                    id="receivedDate"
                    name="receivedDate"
                    value={formData.receivedDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="assignedEmployee">
                    Assigned Employee (Email)
                  </label>
                  <input
                    type="text"
                    id="assignedEmployee"
                    name="assignedEmployee"
                    value={formData.assignedEmployee}
                    onChange={handleInputChange}
                    placeholder="Leave empty for auto-assignment"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Lead"}
                </button>
              </div>
            </form>
          ) : (
            <div className="csv-upload-section">
              <div className="distribution-options">
                <h3>Lead Distribution Strategy</h3>
                <div className="distribution-radios">
                  <label>
                    <input
                      type="radio"
                      name="distributionStrategy"
                      value="smart"
                      checked={distributionStrategy === "smart"}
                      onChange={() => setDistributionStrategy("smart")}
                    />
                    <span>Smart Distribution (Language & Location Match)</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="distributionStrategy"
                      value="equal"
                      checked={distributionStrategy === "equal"}
                      onChange={() => setDistributionStrategy("equal")}
                    />
                    <span>Equal Distribution</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="distributionStrategy"
                      value="none"
                      checked={distributionStrategy === "none"}
                      onChange={() => setDistributionStrategy("none")}
                    />
                    <span>No Auto-Assignment</span>
                  </label>
                </div>
              </div>
              <CsvUpload
                onUploadSuccess={handleUploadSuccess}
                distributionStrategy={distributionStrategy}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
