import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaUpload, FaFileAlt, FaCheck, FaTimes } from "react-icons/fa";
import "../../styles/csvupload.css";

interface CsvUploadProps {
  onUploadSuccess?: () => void;
  distributionStrategy?: string;
}

export const CsvUpload: React.FC<CsvUploadProps> = ({
  onUploadSuccess,
  distributionStrategy = "smart",
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [showErrors, setShowErrors] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Validate file type
      if (
        selectedFile.type !== "text/csv" &&
        selectedFile.name.split(".").pop()?.toLowerCase() !== "csv"
      ) {
        toast.error("Please upload a valid CSV file");
        return;
      }

      // Validate file size (5MB max)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit");
        return;
      }

      setFile(selectedFile);
      setUploadErrors([]);
      setShowErrors(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadErrors([]);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("distributionStrategy", distributionStrategy);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/leads/upload-csv",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            setUploadProgress(progress);
          },
        }
      );

      if (response.data.errors && response.data.errors.length > 0) {
        setUploadErrors(response.data.errors);
        toast.warning(
          `CSV uploaded with ${response.data.errors.length} errors. ${response.data.message}`
        );
      } else {
        toast.success(response.data.message);
      }

      // Reset file input
      setFile(null);
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload CSV file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="csv-upload-container">
      <div className="csv-upload-card">
        <h2 className="csv-upload-title">Upload Leads CSV</h2>

        <div className="csv-upload-area">
          <div className="csv-upload-icon">
            {file ? <FaFileAlt size={40} /> : <FaUpload size={40} />}
          </div>

          <div className="csv-upload-content">
            {file ? (
              <div className="csv-file-selected">
                <p className="csv-filename">{file.name}</p>
                <p className="csv-filesize">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            ) : (
              <p className="csv-upload-text">
                Drag and drop your CSV file here or click to browse
              </p>
            )}

            <input
              type="file"
              id="csv-file-input"
              accept=".csv"
              onChange={handleFileChange}
              className="csv-file-input"
              disabled={isUploading}
            />

            <label htmlFor="csv-file-input" className="csv-browse-btn">
              {file ? "Change File" : "Browse Files"}
            </label>
          </div>
        </div>

        {file && (
          <button
            className="csv-upload-btn"
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? `Uploading... ${uploadProgress}%` : "Upload CSV"}
          </button>
        )}

        {isUploading && (
          <div className="csv-progress-container">
            <div
              className="csv-progress-bar"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        {uploadErrors.length > 0 && (
          <div className="csv-upload-errors">
            <div
              className="csv-errors-header"
              onClick={() => setShowErrors(!showErrors)}
            >
              <span>{uploadErrors.length} errors found</span>
              <span className="csv-toggle-icon">
                {showErrors ? <FaTimes /> : <FaCheck />}
              </span>
            </div>

            {showErrors && (
              <div className="csv-errors-list">
                {uploadErrors.map((error, index) => (
                  <div key={index} className="csv-error-item">
                    {error}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="csv-upload-help">
          <h3>CSV Format Requirements:</h3>
          <ul>
            <li>
              <strong>Required fields:</strong> Name, Language, Location, and
              either Email or Phone
            </li>
            <li>
              <strong>Optional fields:</strong> Status, Type, Received Date,
              Assigned Employee
            </li>
            <li>
              <strong>Status values:</strong> Open, Closed, Ongoing, Pending
              (default: Open)
            </li>
            <li>
              <strong>Type values:</strong> Hot, Warm, Cold (default: Warm)
            </li>
            <li>
              <strong>Dates format:</strong> YYYY-MM-DD
            </li>
            <li>
              <strong>Assigned Employee:</strong> Use employee email
            </li>
            <li>
              <strong>Note:</strong> Field names are case-insensitive (Name/name
              both work)
            </li>
          </ul>
          <a href="/sample-leads.csv" download className="csv-sample-link">
            Download Sample CSV
          </a>
        </div>
      </div>
    </div>
  );
};
