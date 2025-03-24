// import React from "react";
// import '../styles/inputStyle.css'

// const FormTextarea = ({ name, value, holder, onChange }) => {
//   return (
//     <textarea
//       name={name}     
//       value={value}         
//       placeholder={holder}    
//       onChange={onChange}     
//       className="form-control" 
//     />
//   );
// };

// export default FormTextarea;

import React from "react";
import '../styles/inputStyle.css';
import icon from "../properties/icon";

const FormTextarea = ({ label, name, value, holder, onChange, isValid, errorMessage,autofocus,  disabled =false, setHeight,
  setWidth
}) => {
  // Determine the border color based on the validation status
  const textareaClass = `form-control ${isValid === false ? 'is-invalid' : ''}`;

  return (
    <>
      <label htmlFor={name} className="newLabel">{label}</label>
      <div className="input-group">
        <span className="input-group-text">
          <i className={`icon-class ${icon.pen}`}></i>
        </span>
        <textarea
          aria-label="" data-bs-toggle="tooltip" data-bs-placement="auto" title={`Please enter ${label}`}
          id={name}
          name={name}
          value={value}
          placeholder={holder}
          className={textareaClass}
          rows="1"
          onChange={onChange}
          tabIndex="1"
          autoFocus={autofocus}
          disabled={disabled}
          style={{ height: setHeight,
            width : setWidth
           }}
        />
      </div>

      {/* Show error message if validation fails */}
      {isValid === false && <div className="invalid-feedback">{errorMessage}</div>}
    </>
  );
};

export default FormTextarea;

