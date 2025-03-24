// import React from 'react';


// const FormRadio = ({ name, options, value, onChange, errorMessage ,label}) => {
//     return (
//       <div
//       aria-label="" data-bs-toggle="tooltip" data-bs-placement="auto" title={`Please select ${label}`}

//       >
//         <label htmlFor={name} className="newLabel">{label}</label>

//         {options.map((option) => (
//           <div key={option.value} className="form-check">
//             <input
//               type="radio"
//               className="form-check-input"
//               name={name}
//               value={option.value}
//               checked={value === option.value}
//               onChange={onChange}
//               id={option.value}
//             />
//             <label className="form-check-label" htmlFor={option.value}>
//               {option.label}
//             </label>
//           </div>
//         ))}
//         {errorMessage && <div className="text-danger">{errorMessage}</div>}
//       </div>
//     );
//   };

//   export default FormRadio;
  





import React, { useState, useEffect } from 'react';

const FormRadio = ({ name, options, value, onChange, errorMessage, label ,autofocus,  disabled =false, required=false
}) => {
  const [localErrorMessage, setLocalErrorMessage] = useState(errorMessage);

  useEffect(() => {
    // Synchronize the local error message with the errorMessage prop
    setLocalErrorMessage(errorMessage);
  }, [errorMessage]);

  const handleChange = (e) => {
    onChange(e); // Propagate the change to the parent component
    if (e.target.value) {
      setLocalErrorMessage(''); // Clear error when an option is selected
    }
  };

  return (
    <div
      aria-label=""
      data-bs-toggle="tooltip"
      data-bs-placement="auto"
      title={localErrorMessage ? `Please select ${label}` : ''}
    >
      <label htmlFor={name} className="newLabel">{label}{ required &&
        <span className="text-danger ms-2 fw-bolder">|</span>}</label>
      {options.map((option) => (
        <div key={option.value} className="form-check">
          <input
                    disabled={disabled}
            type="radio"
            className="form-check-input"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={handleChange}
            id={option.value}
            autoFocus={autofocus}
            tabIndex={1}

          />
          <label className="form-check-label" htmlFor={option.value}>
            {option.label}
          </label>
        </div>
      ))}
      {localErrorMessage && <div className="error-message1">{localErrorMessage}</div>}
    </div>
  );
};

export default FormRadio;

  