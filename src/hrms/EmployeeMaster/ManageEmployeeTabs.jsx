import React, { useState, useEffect, useContext } from "react";
import "../../styles/Tabs.css";
import { EmployeeContext } from "../../context/EmployeeMaster/EmployeeMasterContext";

function ManageEmployeeTabs() {
    const { renderTabContent,activeTab, setActiveTab} = useContext(EmployeeContext);
  

  // Array of tab titles
  const tabTitles = [
    "Personal Info",
    "Other Details 1",
    "Other Role",
    "Other Details 2",
    "Bank Details",
    "PF Details",
    "Salary Structure",
    // "Earning Deduction Head",
    "Profile Picture",
  ];

  // Validation functions for each tab
  const validatePersonalInfo = (data) => {
    const errors = {};
    if (!data.Gender) errors.Gender = "Gender is required";
    if (!data.Email) errors.Email = "Email is required";
    if (!data["Date of Birth"]) errors["Date of Birth"] = "Date of Birth is required";
    return errors;
  };

  const validateOtherDetails1 = (data) => {
    const errors = {};
    if (!data.someField) errors.someField = "This field is required"; // Just an example
    return errors;
  };

  // Additional validation functions for other tabs should be added here
  const validateOtherRole = (data) => {
    const errors = {};
    // Validate fields specific to Other Role
    return errors;
  };

  // Function to render the correct tab content based on the active tab
 


  // Handle Next button click with validation
  const handleNext = () => {
    const activeTabKey = tabTitles[activeTab];
    let validationErrors = {};

    // // Perform validation for the active tab
    // switch (activeTab) {
    //   case 0: // Personal Info Tab
    //     validationErrors = validatePersonalInfo(formData.personalInfo);
    //     break;
    //   case 1: // Other Details 1 Tab
    //     validationErrors = validateOtherDetails1(formData.otherDetails1);
    //     break;
    //   case 2: // Other Role Tab
    //     validationErrors = validateOtherRole(formData.otherRole);
    //     break;
    //   // Add validation for other tabs here...
    //   default:
    //     break;
    // }

    if (Object.keys(validationErrors).length > 0) {
      // If there are errors, update the error state
    } else if (activeTab < tabTitles.length - 1) {
      // Proceed to the next tab if no validation errors
      setActiveTab(activeTab + 1);
    }

  };

  // Handle Previous button click
  const handlePrev = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  return (
    <div className="tabs-container">
      <div className="tabs">
        {tabTitles.map((title, index) => (
          <button
            key={index}
            className={`tab-button ${activeTab === index ? "active" : ""}`}
            onClick={() => setActiveTab(index)}
          >
            {title}
          </button>
        ))}
      </div>

      <div className="tab-content">{renderTabContent()}</div>

      <div className="tab-navigation">
        <button onClick={handlePrev} disabled={activeTab === 0}>
          Previous
        </button>
        <button onClick={handleNext} disabled={activeTab === tabTitles.length - 1}>
          Next
        </button>
      </div>
    </div>
  );
}

export default ManageEmployeeTabs;
