import React, { useState, useRef } from "react";
import "../../styles/leads.css";

interface CSVUploadModalProps {
  onClose: () => void;
}

export const CSVUploadModal: React.FC<CSVUploadModalProps> = ({ onClose }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleNext = () => {
    // Handle file upload logic here
    console.log("Uploading file:", selectedFile);
    onClose();
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
              Drag your files here to start uploading
            </p>
            <p className="upload-or">OR</p>
            <button className="browse-btn" onClick={handleBrowseClick}>
              Browse Files
            </button>

            {selectedFile && (
              <div className="selected-file">
                <p>Selected: {selectedFile.name}</p>
              </div>
            )}
          </div>

          <div className="file-info">
            <div className="file-info-item">
              <span className="file-info-label">Selected File:</span>
              <span className="file-info-value">
                {selectedFile ? selectedFile.name : "None"}
              </span>
            </div>
            <div className="file-size-icon">📊</div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="next-btn"
            onClick={handleNext}
            disabled={!selectedFile}
          >
            Next →
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
