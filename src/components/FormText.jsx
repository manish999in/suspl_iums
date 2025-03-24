

import React, { useState } from "react";
import "../styles/inputStyle.css";

const FormText = ({
  type,
  name,
  label,
  value,
  holder,
  onChange,
  errorMessage,
  icon,
  Maxlength,
  autofocus,
  disabled =false,
  setHeight,
  setWidth,
  required = false
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="form-group1">
      <label htmlFor={name} className="newLabel">{label}{ required &&
        <span className="text-danger ms-2 fw-bolder">|</span>}
        </label>

      <div className="input-group input-group-sm">
        <span className="input-group-text" id="inputGroup-sizing-sm">
          {icon && <i className={`icon-class ${icon}`} />}
        </span>
        <input
          aria-label="" data-bs-toggle="tooltip" data-bs-placement="auto" title={`Please enter ${label}`}
          className={`form-control form-control-sm ${errorMessage ? 'input-error' : ''}`}  // Add the 'input-error' class if there's an error
          aria-describedby="inputGroup-sizing-sm"
          type={type || "text"}
          name={name}
          value={value || ""}
          id="text1"
          onChange={onChange}
          placeholder={holder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          maxLength={Maxlength}
          tabIndex="1"
          autoFocus={autofocus}
          disabled={disabled}
          
          style={{ height: setHeight,
            width : setWidth
           }}
                  />

      </div>
        {errorMessage && <div className="error-message1">{errorMessage}</div>}
    </div>
  );
};

export default FormText;


