import React, { useState, useRef, useEffect, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faFile, faSpinner } from "@fortawesome/free-solid-svg-icons";
import "../../styles/ProfilePicture.css";
import { getSaveFile } from "../../utils/api";
import { useConvertFile } from "../../hooks/useConvertFile";
import { EmployeeContext } from "../../context/EmployeeMaster/EmployeeMasterContext";

function ProfilePicture() {
  const { setImageRcds, imageRcds } = useContext(EmployeeContext);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [fileIcon, setFileIcon] = useState("");
  const [previewImage, setPreviewImage] = useState(null); // State for image preview
  const fileInputRef = useRef(null); // Ref to the file input element

  const imagesTypes = ["jpeg", "png", "svg", "gif"];

  // File Validation function
  const fileValidate = (fileType, fileSize) => {
    let isImage = imagesTypes.some(
      (type) => fileType.indexOf(`image/${type}`) !== -1
    );

    if (isImage) {
      const type = fileType.split("/")[1]; // Extract type (jpeg, png, etc.)
      setFileIcon(type);
      if (fileSize <= 2000000) {
        // 2MB limit
        return true;
      } else {
        alert("Your file should be 2 Megabytes or less.");
        return false;
      }
    } else {
      alert("Please upload a valid image file.");
      return false;
    }
  };

  // Handle file upload
  const handleFileUpload = (file) => { 
    console.log("File: ", file);
       
    const fileReader = new FileReader();
    const fileType = file.type;
    const fileSize = file.size;


    if (fileValidate(fileType, fileSize)) {
      setIsUploading(true);
      setFile(file); // Save the selected file
      setFileName(file.name);

      fileReader.onloadend = () => {
        setFileType(file.type);
        setProgress(0);
        let counter = 0;
        const interval = setInterval(() => {
          if (counter === 100) {
            clearInterval(interval);
          } else {
            counter += 10;
            setProgress(counter);
          }
        }, 100);

        setTimeout(() => {
          setFileIcon(fileType.split("/")[1]); // Set file type icon (jpg, png, etc.)
        }, 500);

        // Set the preview image once the file is read
        setPreviewImage(fileReader.result); // Store the preview in the state
      };

      fileReader.readAsDataURL(file); // Load the file as a data URL
    }
  };

  // Handle when the file input changes (i.e., when the user selects a file)
  const handleInputChange = (e) => {
    const selectedFile = e.target.files[0];
    console.log("Select File : ", e.target.files);
    
    if (selectedFile) {
      // Only process the file if it has changed
      if (selectedFile.name !== fileName) {
        handleFileUpload(selectedFile);
      }
    }
  };

  useEffect(() => {
    setImageRcds(() => ({
      image: file,
      imageName: fileName,
    }));
  }, [file, fileName]);

  useEffect(() => {
    setFile(imageRcds.image);
    setFileName(imageRcds.imageName);
    if (imageRcds.image !== "") {
      handleFileUpload(imageRcds.image);
    }
    console.log("Image Name: ",imageRcds);
    
  }, []);

 

  // Function to trigger file input when image preview is clicked
  const handlePreviewClick = () => {
    fileInputRef.current.click(); // Trigger file input click on preview image click
  };

  return (
    <div className="upload-area">
      <div className="upload-area__header">
        <h1 className="upload-area__title">Upload your file</h1>
        <p className="upload-area__paragraph">
          File should be an image
          <strong className="upload-area__tooltip">
            Like
            <span className="upload-area__tooltip-data">
              {imagesTypes.join(", ")}
            </span>
          </strong>
        </p>
      </div>

      <div
        className="upload-area__drop-zone"
        onClick={() => fileInputRef.current.click()} // Trigger file input click on drop-zone click
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFileUpload(e.dataTransfer.files[0]); // Handle drag and drop
        }}
      >
        <span className="drop-zone__icon">
          <FontAwesomeIcon icon={faImage} size="3x" />
        </span>
        <p className="drop-zone__paragraph">
          Drop your file here or Click to browse
        </p>
        <input
          type="file"
          ref={fileInputRef} // Using ref to handle the file input
          className="drop-zone__file-input"
          accept="image/*"
          onChange={handleInputChange} // Handle file selection
        />
        {/* {isUploading && (
          <span id="loadingText" className="drop-zone__loading-text">
            <FontAwesomeIcon icon={faSpinner} spin /> Please Wait...
          </span>
        )} */}
        {previewImage && (
          <img
            src={previewImage} // Use the preview stored in state
            alt="Preview"
            id="previewImage"
            className="drop-zone__preview-image"
            onClick={handlePreviewClick} // Trigger file input when clicking on the preview image
          />
        )}
      </div>

      {file && (
        <div className="upload-area__file-details">
          <h3 className="file-details__title">Uploaded File</h3>
          <div className="uploaded-file">
            <div className="uploaded-file__icon-container">
              <FontAwesomeIcon
                icon={faFile}
                size="2x"
                className="uploaded-file__icon"
              />
              <span className="uploaded-file__icon-text">{fileIcon}</span>
            </div>

            <div className="uploaded-file__info">
              <span className="uploaded-file__name">{fileName}</span>
              <span className="uploaded-file__counter">{progress}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePicture;
