import React, { useState, useRef } from "react";
import "../../styles/leads.css";
import axios from "axios";
import { toast } from "react-toastify";
import { LEAD_API } from "../../config/api.config";
import { FaFileCsv } from "react-icons/fa";

interface CSVUploadModalProps {
  onClose: () => void;
}

export const CSVUploadModal: React.FC<CSVUploadModalProps> = ({ onClose }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadPhase, setUploadPhase] = useState<
    "uploading" | "processing" | "verifying"
  >("uploading");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadController, setUploadController] =
    useState<AbortController | null>(null);

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

  const handleCancelUpload = () => {
    if (uploadController) {
      uploadController.abort();
      setUploadController(null);
    }
    setIsUploading(false);
    setUploadProgress(0);
    setUploadPhase("uploading");
    toast.info("Upload cancelled");
  };

  const simulateProcessingProgress = () => {
    return new Promise<void>((resolve) => {
      setUploadPhase("processing");
      let progress = 85;

      const interval = setInterval(() => {
        progress += Math.random() * 5;
        if (progress >= 95) {
          setUploadProgress(95);
          setUploadPhase("verifying");
          clearInterval(interval);

          // Simulate verification phase
          setTimeout(() => {
            setUploadProgress(100);
            setTimeout(resolve, 500);
          }, 1000);
        } else {
          setUploadProgress(Math.min(progress, 95));
        }
      }, 200);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadPhase("uploading");

    const controller = new AbortController();
    setUploadController(controller);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("distributionStrategy", "smart");

    try {
      const response = await axios.post(`${LEAD_API}/upload-csv`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        signal: controller.signal,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            // Upload progress goes from 0% to 85%
            const uploadProgress = Math.round(
              (progressEvent.loaded * 85) / progressEvent.total
            );
            setUploadProgress(Math.min(uploadProgress, 85));

            // When upload reaches 85%, start processing simulation
            if (uploadProgress >= 85) {
              simulateProcessingProgress();
            }
          }
        },
      });

      // If upload finished but we haven't started processing yet, start it now
      if (uploadProgress < 85) {
        setUploadProgress(85);
        await simulateProcessingProgress();
      }

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
      if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
        // Upload was cancelled, don't show error
        return;
      }
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload CSV file");
    } finally {
      setIsUploading(false);
      setUploadController(null);
      setUploadPhase("uploading");
    }
  };

  // Get phase-specific text
  const getPhaseText = () => {
    switch (uploadPhase) {
      case "uploading":
        return {
          title: "Uploading...",
          description: "Please wait while we upload your CSV file",
        };
      case "processing":
        return {
          title: "Processing...",
          description: "Analyzing and parsing your CSV data",
        };
      case "verifying":
        return {
          title: "Verifying...",
          description: "Validating data and assigning leads",
        };
      default:
        return {
          title: "Uploading...",
          description: "Please wait while we upload your CSV file",
        };
    }
  };

  // Circular progress component
  const CircularProgress = ({ progress }: { progress: number }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className="circular-progress-container">
        <svg className="circular-progress" width="120" height="120">
          <circle
            className="circular-progress-bg"
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#e6e6e6"
            strokeWidth="8"
          />
          <circle
            className="circular-progress-fill"
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#4CAF50"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 60 60)"
            style={{
              transition: "stroke-dashoffset 0.3s ease",
            }}
          />
        </svg>
        <div className="progress-text">
          <span className="progress-percentage">{Math.round(progress)}%</span>
        </div>
      </div>
    );
  };

  const phaseText = getPhaseText();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="csv-upload-modal" onClick={(e) => e.stopPropagation()}>
        {!isUploading ? (
          <>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">CSV Upload</h2>
                <p className="upload-subtitle">Add your document here</p>
              </div>
              <button className="close-btn" onClick={onClose}>
                ×
              </button>
            </div>

            <div className="modal-content">
              <div
                className={`upload-area ${isDragOver ? "drag-over" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div
                  className="upload-icon"
                  style={{ fontSize: "40px", color: "#000000" }}
                >
                  <FaFileCsv />
                </div>
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
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button
                className="next-btn"
                onClick={handleUpload}
                disabled={!selectedFile}
              >
                Upload
              </button>
            </div>
          </>
        ) : (
          <div className="upload-progress-modal">
            <div className="progress-content">
              <CircularProgress progress={uploadProgress} />
              <h3 className="progress-title">{phaseText.title}</h3>
              <p className="progress-description">{phaseText.description}</p>
              <button
                className="cancel-upload-btn"
                onClick={handleCancelUpload}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

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
