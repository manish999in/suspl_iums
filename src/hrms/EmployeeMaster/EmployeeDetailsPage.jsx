import React, { useState, useContext, useEffect, useRef } from "react";
import { EmployeeContext } from "../../context/EmployeeMaster/EmployeeMasterContext";
import { Modal, Button } from "react-bootstrap";
// import "../styles/EmployeeDetailsPage.css"; // Custom Styles for Modal

import hlogo from "../../../public/img/h-logo.png";

const EmployeeDetailsPage = ({ show, handleClose }) => {
  const {
    pfDetailsRcds,
    otherRoleData,
    imageRcds,
    rcds,
    personalInfoRcds,
    otherDetail2Rcds,
    otherDetail1Rcds,
    salaryStructRcds,
    bankDetailsRcds,
  } = useContext(EmployeeContext);

    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [fileType, setFileType] = useState("");
    const [progress, setProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [fileIcon, setFileIcon] = useState("");
    const [previewImage, setPreviewImage] = useState(null); // State for image preview
    const fileInputRef = useRef(null); // Ref to the file input element


  const handleFileUpload = (file) => {
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

    useEffect(() => {
      setFile(imageRcds.image);
      setFileName(imageRcds.imageName);
      if(imageRcds.image !== ""){
        handleFileUpload(imageRcds.image);
      }
    }, []);

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="xl"
      dialogClassName="employee-details-modal"
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Body>
        <div className="modal-header">
          <img src={hlogo} alt="Logo" className="logo" />
          {/* <h2>Employee Agreement</h2> */}
          <button className="close-btn" onClick={handleClose}>
            &times;
          </button>
        </div>

        <div className="modal-content">
          <h3>Employee Details</h3>

          <div className="section">
            <h5>Personal Information</h5>
            <ul>
              <li><strong>Name:</strong> {rcds.empName}</li>
              <li><strong>Email:</strong> {personalInfoRcds.email}</li>
              <li><strong>Date of Birth:</strong> {personalInfoRcds.dob}</li>
              <li><strong>Gender:</strong> {personalInfoRcds.gender}</li>
              <li><strong>Mobile:</strong> {personalInfoRcds.mobile}</li>
              <li><strong>State:</strong> {personalInfoRcds.state}</li>
            </ul>
          </div>

          <hr className="divider" />

          <div className="section">
            <h5>Job and Department Details</h5>
            <ul>
              <li><strong>Department:</strong> {otherDetail1Rcds.department}</li>
              <li><strong>Designation:</strong> {otherDetail1Rcds.designation}</li>
              <li><strong>Location:</strong> {otherDetail1Rcds.location}</li>
              <li><strong>Date of Joining:</strong> {otherDetail1Rcds.dateOfJoining}</li>
              <li><strong>Is Probation:</strong> {otherDetail1Rcds.isProbation ? "Yes" : "No"}</li>
            </ul>
          </div>

          <hr className="divider" />

          <div className="section">
            <h5>Employment Status & Other Info</h5>
            <ul>
              <li><strong>Reporting To:</strong> {otherDetail2Rcds.reportingTo}</li>
              <li><strong>Salary Bill Type:</strong> {otherDetail2Rcds.salaryBillType}</li>
              <li><strong>On Deputation:</strong> {otherDetail2Rcds.onDeputation ? "Yes" : "No"}</li>
              <li><strong>Class:</strong> {otherDetail2Rcds.class}</li>
            </ul>
          </div>

          <hr className="divider" />

          <div className="section">
            <h5>Bank Account Information</h5>
            <ul>
              <li><strong>Bank Name:</strong> {bankDetailsRcds.bank}</li>
              <li><strong>Account Type:</strong> {bankDetailsRcds.accountType}</li>
              <li><strong>Account Number:</strong> {bankDetailsRcds.accountNumber}</li>
              <li><strong>IFSC Code:</strong> {bankDetailsRcds.ifsc}</li>
            </ul>
          </div>

          <hr className="divider" />

          <div className="section">
            <h5>Provident Fund Details</h5>
            <ul>
              <li><strong>Account Type:</strong> {pfDetailsRcds.bankCPFGPFNPS}</li>
              <li><strong>Account Number:</strong> {pfDetailsRcds.accountCPFGPFNPS}</li>
              <li><strong>Balance:</strong> {pfDetailsRcds.balanceCPFGPFNPS}</li>
            </ul>
          </div>

          <hr className="divider" />

          <div className="section">
            <h5>Salary and Pay Details</h5>
            <ul>
              <li><strong>Basic Pay:</strong> {salaryStructRcds.basic}</li>
              <li><strong>Entry Pay Level:</strong> {salaryStructRcds.entryPayLevel}</li>
              <li><strong>Increment Type:</strong> {salaryStructRcds.incrementType}</li>
              <li><strong>Designation:</strong> {salaryStructRcds.designation}</li>
            </ul>
          </div>

          <hr className="divider" />

          <div className="section">
            <h5>Profile Picture</h5>
            {imageRcds.image ? (
              <img src={previewImage} alt="Employee Profile" className="profile-img" />
            ) : (
              <p>No profile picture available.</p>
            )}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default EmployeeDetailsPage;
