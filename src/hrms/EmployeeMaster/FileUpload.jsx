import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/ProfilePicture.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faFile, faSpinner } from "@fortawesome/free-solid-svg-icons";

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileType = file.type.split("/")[0];
      // Check if the selected file is an image
      if (fileType === "image") {
        setSelectedFile(file);
        setError(""); // Clear any previous errors
      } else {
        setError("Please select a valid image file.");
        setSelectedFile(null); // Clear the selected file if not an image
      }
    }
  };

  // Handle drag and drop (optional)
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const fileType = file.type.split("/")[0];
      // Check if the dropped file is an image
      if (fileType === "image") {
        setSelectedFile(file);
        setError(""); // Clear any previous errors
      } else {
        setError("Please select a valid image file.");
        setSelectedFile(null); // Clear the selected file if not an image
      }
    }
  };

  // Prevent default behavior for drag over
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="container p-5">
      <div className="row">
        <div className="col-md-6 mt-5">
          <div className="upload-area">
            <div
              className="upload-area__drop-zone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <label htmlFor="files" className="dropzone-container">
                <div className="file-icon">
                  <FontAwesomeIcon icon={faImage} size="3x" className="PhotosIcons"/>
                </div>
                <div className="text-center pt-3 px-5">
                  <p className="w-80 text-dark">
                    Drag your photos here to start uploading.
                  </p>
                  <div className="hr-sect">or</div>
                </div>
              </label>
              <input
                id="files"
                name="files[]"
                type="file"
                className="file-input"
                onChange={handleFileChange}
                accept="image/*" // Restrict file type to images only
              />
            </div>
            {error && <div className="text-danger mt-3">{error}</div>}
            {selectedFile && (
              <div className="upload-area__file-details">
                <p className="text-success">
                  File selected: <strong>{selectedFile.name}</strong>
                </p>
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Selected"
                  className="img-fluid"
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "8px",
                    height:"200px",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
