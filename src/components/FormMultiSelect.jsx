import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import '../styles/SelectDropdown.css';

const FormMultiSelect = ({
  id,
  name,
  label,
  selectedValues,
  onSelects,
  resetValue = false,
  errorMessage = '',
  holder = 'Select Option',
  options = [],
  size = 'larger', // Default to larger size
  autofocus = '',
  disabled =false,
  required = false

}) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [localErrorMessage, setLocalErrorMessage] = useState(errorMessage);

  useEffect(() => {
    // Reset dropdown or set selected values
    if (resetValue) {
      setSelectedOptions([]);
    } else {
      const selected = options.filter((option) => selectedValues.includes(option.value));
      setSelectedOptions(selected);
    }
  }, [resetValue, selectedValues, options]);

  useEffect(() => {
    // Update error message from props
    setLocalErrorMessage(errorMessage);
  }, [errorMessage]);

  const handleChange = (selected) => {
    setSelectedOptions(selected);
    const selectedValues = selected ? selected.map((item) => item.value) : [];
    onSelects(selectedValues);
    // Clear error message on valid selection
    if (selected && selected.length > 0) {
      setLocalErrorMessage('');
    }
  };

  const hasError = Boolean(localErrorMessage);

  // Dynamic styles based on size
  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: size === 'small' ? '30px' : '38px', // Adjust height for small size
      padding: size === 'small' ? '0 8px' : '0 12px', // Adjust padding for small size
      borderColor: hasError ? 'red' : base.borderColor,
      boxShadow: hasError ? '0 0 0 1px red' : base.boxShadow,
      '&:hover': {
        borderColor: hasError ? 'red' : base.borderColor,
      },
      '&:focus': {
        borderColor: '#007bff',  // Custom focus color
        boxShadow: '0 0 0 1px #007bff', // Optional: Add a focus shadow
      },
    }),
  };

  return (
    <div className={`select-component ${hasError ? 'error' : ''}`}>
      <label htmlFor={id} className="newLabel">{label}{ required &&
        <span className="text-danger ms-2 fw-bolder">|</span>}</label>
      <Select
        disabled={disabled}
        id={id}
        name={name}
        value={selectedOptions}
        onChange={handleChange}
        options={options}
        isMulti
        isSearchable
        placeholder={holder}
        classNamePrefix="custom-select"
        className={hasError ? 'border-red' : ''}
        styles={customStyles}
        tabIndex="1"
        autoFocus={autofocus}
        isDisabled={disabled}

      />
      {hasError && <div className="error-message1">{localErrorMessage}</div>}
    </div>
  );
};

export default FormMultiSelect;
