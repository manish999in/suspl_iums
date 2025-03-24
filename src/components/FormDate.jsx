import React, { useState } from "react";
import "../styles/inputStyle.css";

const FormDate = ({
  type,
  name,
  label,
  value,
  onChange,
  errorMessage,
  icon,
  autofocus,
  disabled =false,
  required = false
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="form-group1">
      <label htmlFor={name} className="newLabel">
        {label}{ required &&
        <span className="text-danger ms-2 fw-bolder">|</span>}
      </label>

      <div className="input-group input-group-sm">
        <span className="input-group-text" id="inputGroup-sizing-sm">
          {icon && <i className={`icon-class ${icon}`} />}
        </span>
        <input
          autoFocus={autofocus}
          aria-label=""
          data-bs-toggle="tooltip"
          data-bs-placement="auto"
          title={`Please enter ${label}`}
          className={`form-control form-control-sm ${
            errorMessage ? "input-error" : ""
          } ${isFocused ? "focused" : ""}`} // Add 'focused' class when focused
          aria-describedby="inputGroup-sizing-sm"
          type={type || "Date"}
          name={name}
          value={value || ""}
          id="text1"
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          tabIndex={1}
          placeholder="dd/mm/yyyy"
          disabled={disabled}


        />
      </div>
      {errorMessage && <div className="error-message1">{errorMessage}</div>}
    </div>
  );
};

export default FormDate;
