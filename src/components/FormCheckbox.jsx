import React, { useState } from "react";
import "../styles/inputStyle.css";
import "@fortawesome/fontawesome-free/css/all.min.css"; // Import Font Awesome

const FormCheckbox = ({
  name,
  checked,
  onChange,
  label,
  iconClass,
  bdr,
  padds,
  errorMessage,
  autofocus,
  disabled =false,
  required = false,

}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Style for the checkbox container
  const wrapperStyle = {
    border: bdr,
    padding: padds,
    outline: "none",
    display: "flex", // Flexbox to align items
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: "4px", // Add border radius
    marginTop: "1rem",
  };

  return (
    <div
      className="form-group"
      aria-label=""
      data-bs-toggle="tooltip"
      data-bs-placement="auto"
      title={`Please select ${label}`}
    >
      <div className="form-check form-switch" style={wrapperStyle}>
        <input
          className="form-check-input"
          type="checkbox"
          role="switch"
          name={name}
          checked={checked}
          onChange={onChange} // Ensure the event is passed here
          id={name} // Unique ID for the checkbox
          onFocus={() => setIsFocused(true)} // Set focus state on click/focus
          onBlur={() => setIsFocused(false)} // Reset focus state on blur
          autoFocus={autofocus}
          tabIndex={1}
          disabled={disabled}

        />
        <label className="form-check-label mx-2" htmlFor={name}>
       {label}{ required &&
        <span className="text-danger ms-2 fw-bolder">|</span>}
        </label>
      </div>
      {errorMessage && <div className="error-message">{errorMessage}</div>}{" "}
      {/* Display error message */}
    </div>
  );
};

export default FormCheckbox;
