import React, { useState } from "react";
import "../styles/inputStyle.css";

const FormNumber = ({
  type,
  name,
  label,
  value,
  onChange,
  errorMessage,
  icon,
  autofocus,
  disabled =false,
  required= false
  
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="form-group1">
      <label htmlFor={name} className="newLabel">{label}{ required &&
        <span className="text-danger ms-2 fw-bolder">|</span>}</label>

      <div className="input-group input-group-sm">
        <span className="input-group-text" id="inputGroup-sizing-sm">
          {icon && <i className={`icon-class ${icon}`} />}
        </span>
        <input
          aria-label="" 
          data-bs-toggle="tooltip" 
          data-bs-placement="auto" 
          title={`Please enter ${label}`}
          className={`form-control form-control-sm ${errorMessage ? 'input-error' : ''} ${isFocused ? 'focused' : ''}`}  // Add 'focused' class when focused
          aria-describedby="inputGroup-sizing-sm"
          type={type || "number"}
          name={name}
          value={value || ""}
          id="text1"
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoFocus={autofocus}
          tabIndex={1}
          disabled={disabled}


        />
      </div>
      {errorMessage && <div className="error-message1">{errorMessage}</div>}
    </div>
  );
};

export default FormNumber;
