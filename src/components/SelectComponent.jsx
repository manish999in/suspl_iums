// import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
// import Select from 'react-select';
// import '../styles/SelectDropdown.css'

// const SelectComponent = ({
//   id,
//   name,
//   label,
//   selectedValue,
//   onSelects,
//   resetValue = false,
//   errorMessage = '',
//   holder = 'Select Option',
//   options = [],
// }) => {
//   const [selectedOption, setSelectedOption] = useState(null);
//   const [hasError, setHasError] = useState(false);


//   // Handle resetting the dropdown and updating the selected value
//   useEffect(() => {
//     if (resetValue) {
//       setSelectedOption(null);
//     } else {
//       const option = options.find(option => option.value === selectedValue);
//       setSelectedOption(option || null);
//     }
//   }, [resetValue, selectedValue, options]);

//   const handleChange = (selected) => {
//     setSelectedOption(selected);
//     onSelects(selected ? selected.value : null);
//   };

//   useEffect(() => {
//     setHasError(!!errorMessage);
//   }, [errorMessage]);


//   return (
//     <div aria-label="" data-bs-toggle="tooltip" data-bs-placement="auto" title={`Please select ${label}`}
//     >
//       <label htmlFor={id} className="newLabel">{label}</label>
//       <Select
//         id={id}
//         name={name}
//         value={selectedOption}
//         onChange={handleChange}
//         options={options}
//         isSearchable
//         placeholder={holder}
//         classNamePrefix="custom-select" // Add prefix for easier styling targeting
//         className={errorMessage ? 'border-red' : ''}  // Conditional class to apply error border
//         styles={{
//           control: (base) => ({
//             ...base,
//             borderColor: errorMessage ? 'red' : base.borderColor, // Apply red border if there's an error
//             boxShadow: errorMessage ? '0 0 0 1px red' : base.boxShadow, // Optional: add shadow effect
//           }),
//         }}
//       />
//       {errorMessage && <div className="error-message1">{errorMessage}</div>}

//     </div>
//   );
// };

// export default SelectComponent;









// import React, { useState, useEffect } from 'react';
// import Select from 'react-select';
// import '../styles/SelectDropdown.css';

// const SelectComponent = ({
//   id,
//   name,
//   label,
//   selectedValue,
//   onSelects,
//   resetValue = false,
//   errorMessage = '',
//   holder = 'Select Option',
//   options = [],
// }) => {
//   const [selectedOption, setSelectedOption] = useState(null);
//   const [localErrorMessage, setLocalErrorMessage] = useState(errorMessage);

//   useEffect(() => {
//     // Reset dropdown or set selected value
//     if (resetValue) {
//       setSelectedOption(null);
//     } else {
//       const option = options.find((option) => option.value === selectedValue);
//       setSelectedOption(option || null);
//     }
//   }, [resetValue, selectedValue, options]);

//   useEffect(() => {
//     // Update error message from props
//     setLocalErrorMessage(errorMessage);
//   }, [errorMessage]);

//   const handleChange = (selected) => {
//     setSelectedOption(selected);
//     onSelects(selected ? selected.value : null);
//     // Clear error message on valid selection
//     if (selected) {
//       setLocalErrorMessage('');
//     }
//   };

//   const hasError = Boolean(localErrorMessage);

//   return (
//     <div className={`select-component ${hasError ? 'error' : ''}`}>
//       <label htmlFor={id} className="newLabel">{label}</label>
//       <Select
//         id={id}
//         name={name}
//         value={selectedOption}
//         onChange={handleChange}
//         options={options}
//         isSearchable
//         placeholder={holder}
//         classNamePrefix="custom-select"
//         className={hasError ? 'border-red' : ''}
//         styles={{
//           control: (base) => ({
//             ...base,
//             borderColor: hasError ? 'red' : base.borderColor,
//             boxShadow: hasError ? '0 0 0 1px red' : base.boxShadow,
//             '&:hover': {
//               borderColor: hasError ? 'red' : base.borderColor,
//             },
//           }),
//         }}
//       />
//       {hasError && <div className="error-message1">{localErrorMessage}</div>}
//     </div>
//   );
// };

// export default SelectComponent;



// import React, { useState, useEffect } from 'react';
// import Select from 'react-select';
// import '../styles/SelectDropdown.css';

// const SelectComponent = ({
//   id,
//   name,
//   label,
//   selectedValue,
//   onSelects,
//   resetValue = false,
//   errorMessage = '',
//   holder = 'Select Option',
//   options = [],
//   size = 'larger', // Default to medium size
// }) => {
//   const [selectedOption, setSelectedOption] = useState(null);
//   const [localErrorMessage, setLocalErrorMessage] = useState(errorMessage);

//   useEffect(() => {
//     // Reset dropdown or set selected value
//     if (resetValue) {
//       setSelectedOption(null);
//     } else {
//       const option = options.find((option) => option.value === selectedValue);
//       setSelectedOption(option || null);
//     }
//   }, [resetValue, selectedValue, options]);

//   useEffect(() => {
//     // Update error message from props
//     setLocalErrorMessage(errorMessage);
//   }, [errorMessage]);

//   const handleChange = (selected) => {
//     setSelectedOption(selected);
//     onSelects(selected ? selected.value : null);
//     // Clear error message on valid selection
//     if (selected) {
//       setLocalErrorMessage('');
//     }
//   };

//   const hasError = Boolean(localErrorMessage);

//   // Dynamic styles based on size
//   const customStyles = {
//     control: (base) => ({
//       ...base,
//       borderColor: hasError ? 'red' : base.borderColor,
//       boxShadow: hasError ? '0 0 0 1px red' : base.boxShadow,
//       '&:hover': {
//         borderColor: hasError ? 'red' : base.borderColor,
//       },
//       minHeight: size === 'small' ? '30px' : '38px', // Adjust height for small size
//       padding: size === 'small' ? '0 8px' : '0 12px', // Adjust padding for small size
//     }),
//   };

//   return (
//     <div className={`select-component ${hasError ? 'error' : ''}`}>
//       <label htmlFor={id} className="newLabel">{label}</label>
//       <Select
//         id={id}
//         name={name}
//         value={selectedOption}
//         onChange={handleChange}
//         options={options}
//         isSearchable
//         placeholder={holder}
//         classNamePrefix="custom-select"
//         className={hasError ? 'border-red' : ''}
//         styles={customStyles}
//       />
//       {hasError && <div className="error-message1">{localErrorMessage}</div>}
//     </div>
//   );
// };

// export default SelectComponent;


import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import '../styles/SelectDropdown.css';

const SelectComponent = ({
  id,
  name,
  label,
  selectedValue,
  onSelects,
  resetValue = false,
  errorMessage = '',
  holder = 'Select Option',
  options = [],
  size = 'larger', // Default to larger size
  autofocus = '',
  width ='auto',
  disabled =false,
  required = false,
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [localErrorMessage, setLocalErrorMessage] = useState(errorMessage);

  useEffect(() => {
    // Reset dropdown or set selected value
    if (resetValue) {
      setSelectedOption(null);
    } else {
      const option = options.find((option) => option.value === selectedValue);
      setSelectedOption(option || null);
    }
  }, [resetValue, selectedValue, options]);

  useEffect(() => {
    // Update error message from props
    setLocalErrorMessage(errorMessage);
  }, [errorMessage]);

  const handleChange = (selected) => {
    setSelectedOption(selected);
    onSelects(selected ? selected.value : null);
    // Clear error message on valid selection
    if (selected) {
      setLocalErrorMessage('');
    }
  };

  const hasError = Boolean(localErrorMessage);

  // Dynamic styles based on size
  const customStyles = {
    control: (base, state) => ({
      ...base,
      width : width ,
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
      }
    }),
  };
  
  return (
    <div className={`select-component ${hasError ? 'error' : ''}`}>
      <label htmlFor={id} className="newLabel">{label}{ required &&
        <span className="text-danger ms-2 fw-bolder">|</span>}</label>
      <Select
        id={id}
        name={name}
        value={selectedOption}
        onChange={handleChange}
        options={options}
        isSearchable
        placeholder={holder}
        classNamePrefix="custom-select"
        className={hasError ? 'border-red' : ''}
        styles={customStyles}
        tabIndex="1"
        autoFocus={autofocus}
        disabled={disabled}
        isDisabled={disabled}
      />
      {hasError && <div className="error-message1">{localErrorMessage}</div>}
    </div>
  );
};

export default SelectComponent;

