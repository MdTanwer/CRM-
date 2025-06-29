import React from "react";
import { CsvUpload } from "../components/leads/CsvUpload";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const LeadsUpload: React.FC = () => {
  const navigate = useNavigate();

  const handleUploadSuccess = () => {
    // Wait a bit before redirecting to let the user see the success message
    setTimeout(() => {
      navigate("/leads");
    }, 2000);
  };

  return (
    <div className="leads-upload-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigate("/leads")}>
          <FaArrowLeft /> Back to Leads
        </button>
        <h1>Import Leads</h1>
      </div>

      <div className="upload-instructions">
        <h2>Upload Instructions</h2>
        <p>
          Use this page to upload a CSV file containing lead information. The
          system will process the file and add valid leads to your database.
        </p>
        <div className="instruction-steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Prepare your CSV file</h3>
              <p>
                Make sure your CSV file follows the required format. You can
                download a sample template below.
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Upload your file</h3>
              <p>
                Click the upload area to select your CSV file or drag and drop
                it directly.
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Review results</h3>
              <p>
                After uploading, you'll see a summary of the imported leads and
                any errors that occurred.
              </p>
            </div>
          </div>
        </div>
      </div>

      <CsvUpload onUploadSuccess={handleUploadSuccess} />
    </div>
  );
};

export default LeadsUpload;
