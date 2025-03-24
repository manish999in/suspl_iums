import React, { useState, useEffect } from "react";
import FormLabel from "./FormLabel";
import "../styles/inputStyle.css";
import Cookies from "js-cookie";
import {
  retrieveFromLocalStorage,
  retrieveFromCookies,
  storeInLocalStorage,
} from "../utils/CryptoUtils";

const Location = ({ setChartType, setChartType2 }) => {
  const [formData, setFormData] = useState({
    ddoLocation: "",
    financialYear: "",
    module: "",
  });

  const userDpt = retrieveFromCookies("userDptRole") || "";
  let userDptRole;
  if (userDpt != "") {
    userDptRole = JSON.parse(userDpt);
  } else {
    userDptRole = "";
  }

  const ddoLoc = userDptRole.loc || "Head Quarter";
  const role = userDptRole.roleName || "Admin";

  // Effect to set the chartType when the module changes
  useEffect(() => {
    if (formData.module === "module1") {
      setChartType("hrms");
      setChartType2(""); // Set to 'hrms' for HRMS module
    } else if (formData.module === "module2") {
      setChartType2("finance");
      setChartType("");
      // Set to empty string for Payroll module to hide charts
    } else {
      setChartType(""); // Reset chartType when no module is selected
    }
  }, [formData.module, setChartType]); // Run effect when module changes

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="row mb-4">
      {/* DDO Location Field */}
      <div className="col-md-3">
        <div className="form-group">
          <FormLabel labelNames="DDO Location" />
          <select
            name="ddoLocation"
            value={formData.ddoLocation}
            onChange={handleChange}
            className="form-control"
            style={{ fontSize: "13px" }}
            disabled
            title="DDO Location is fixed."
            tabIndex="1"
          >
            <option value="location1">{ddoLoc}</option>
          </select>
        </div>
      </div>

      {/* Financial Year Field */}
      <div className="col-md-3">
        <div className="form-group">
          <FormLabel labelNames="Financial Year" />
          <select
            name="financialYear"
            value={formData.financialYear}
            onChange={handleChange}
            className="form-control"
            style={{ fontSize: "13px" }}
            disabled
            title="Financial Year is fixed."
          >
            <option value="module1">2024</option>
          </select>
        </div>
      </div>

      {/* Module Field */}
      <div className="col-md-3">
        <div className="form-group">
          <FormLabel labelNames="Module" />
          <select
            disabled
            name="module"
            value={formData.module}
            onChange={handleChange}
            className="form-control"
            style={{ fontSize: "13px" }}
            title="Module is fixed."
          >
            <option value="module1">HRMS & Payroll</option>
          </select>
        </div>
      </div>

      {/* Placeholder for Future Options or Additional Fields */}
      <div className="col-md-3">
        <div className="form-group">
          <FormLabel labelNames="Role" />
          <select
            disabled
            className="form-control"
            style={{ fontSize: "13px" }}
          >
            <option value="">{role}</option>
            {/* Add options here if necessary */}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Location;
