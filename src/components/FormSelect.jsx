import React, { useState } from "react";
import '../styles/inputStyle.css';

const FormSelect = ({ name, value, options, onChange, bdr, padds, errorMessage, icon }) => {
  const [isFocused, setIsFocused] = useState(false);

  const wrapperStyle = {
    border: bdr,
    padding: padds,
    borderColor: isFocused ? '#ccc' : (errorMessage ? '#ff8080' : '#ccc'), // Red border on error
    boxShadow: isFocused
      ? '0 0 5px #ccc'
      : (errorMessage ? '0 0 5px #ff4d4d' : '0 0 5px rgba(0, 0, 0, 0.1)'), // Red shadow on error
    borderWidth: '2px',
    borderStyle: 'solid',
    outline: 'none',
    display: 'flex', // Flexbox to align icon and select
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: '10px', // Add border radius here
    
  };

  const selectStyle = {
    border: 'none',
    outline: 'none',
    flex: 1, // Take up remaining space
    appearance: 'none', // Hide default dropdown arrow
    backgroundColor: 'transparent',
    padding: padds,
  };

  return (
    <div className="form-group">
      <div style={wrapperStyle}>
        {/* Display icon inside border with its own border and centered alignment */}
        {icon && (
          <div className="icon-container">
            <i className={`icon-class ${icon}`} />
          </div>
        )}

        {/* Select dropdown */}
        <select
        
          className="form-control"
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          style={selectStyle}
          onFocus={() => setIsFocused(true)} // Set focus state on focus
          onBlur={() => setIsFocused(false)} // Reset focus state on blur
          tabIndex="1"
        >
          <option value="">
             Select an option
            </option>
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Display error message below select */}
      {errorMessage && <div className="error-message">{errorMessage}</div>}
    </div>
  );
};

export default FormSelect;

