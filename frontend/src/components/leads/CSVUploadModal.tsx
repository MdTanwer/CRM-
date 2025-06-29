import React, { useState, useRef } from "react";
import "../../styles/leads.css";
import axios from "axios";
import { toast } from "react-toastify";

interface CSVUploadModalProps {
  onClose: () => void;
}

export const CSVUploadModal: React.FC<CSVUploadModalProps> = ({ onClose }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === "text/csv") {
      setSelectedFile(files[0]);
    } else {
      toast.error("Please upload a valid CSV file");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (files[0].type === "text/csv" || files[0].name.endsWith(".csv")) {
        setSelectedFile(files[0]);
      } else {
        toast.error("Please upload a valid CSV file");
      }
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("distributionStrategy", "smart");

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
        toast.warning(
          `CSV uploaded with ${response.data.errors.length} errors. ${response.data.message}`
        );
      } else {
        toast.success(response.data.message || "CSV uploaded successfully");
      }

      // Close modal after successful upload
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload CSV file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="csv-upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">CSV Upload</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <p className="upload-subtitle">Add your document here</p>

          <div
            className={`upload-area ${isDragOver ? "drag-over" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="upload-icon">📁</div>
            <p className="upload-text">
              Drag your CSV file here to start uploading
            </p>
            <p className="upload-or">OR</p>
            <button className="browse-btn" onClick={handleBrowseClick}>
              Browse Files
            </button>

            {selectedFile && (
              <div className="selected-file">
                <p>Selected: {selectedFile.name}</p>
                <p>Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
              </div>
            )}

            {isUploading && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p>{uploadProgress}% Uploaded</p>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="cancel-btn"
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            className="next-btn"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
};
