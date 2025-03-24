import React from "react";
import '../styles/inputStyle.css';

const FormButton = ({
  btnType1,   // Label for Save button
  btnType2,   // Label for Delete button
  btnType3,   // Label for Update button
  btnType4,   // Label for Back button
  btnType5,   // Label for Reset button
  onClick,    // Event handler for Save, Delete, Update buttons
  onBack,     // Event handler for Back button
  onReset,    // Event handler for Reset button
  showUpdate, // Boolean to show Update/Back buttons
  rcds,        // Object containing the form data,
  loading
}) => {
  // Check if any field in rcds has a non-empty value
  const hasInputValues = Object.values(rcds).some(value => value !== "");

  return (
    <>
      {/* Save Button */}
      <button
        data-bs-toggle="tooltip"
        data-bs-placement="auto"
        title={`Click to Save {Ctrl + S}`}
        tabIndex="1"
        type="button"
        name="save"
        className="btn btn-primary btn-color  btn-sm"
        onClick={!loading ? onClick : null} // Prevent click during loading
        disabled={loading} // Disable button while loading
        style={{ display: showUpdate ? 'none' : 'inline-block' }} // Hide if update button is shown


      >
        {loading ? ( // Show loading state
          <>
            <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
          </>
        ) : (
          btnType1 // Display Save button label
        )}
      </button>


      {/* Delete Button */}
      <button
        tabIndex="1"
        type="button"
        name="delete"
        className="btn btn-danger btn-color btn-sm"
        onClick={onClick}
        style={{ display: btnType2 ? 'inline-block' : 'none' }} // Show only if btnType2 is defined
      >
        btnType2
      </button>

      {/* Update Button */}
      <button
        data-bs-toggle="tooltip"
        data-bs-placement="auto"
        title={`Click to Update {Ctrl + S}`}
        tabIndex="1"
        type="button"
        name="update"
        className="btn btn-success btn-color  btn-sm"
        onClick={onClick}
        style={{ display: showUpdate ? 'inline-block' : 'none' }} // Show only if update button is needed
      >
        {showUpdate && loading ? ( // Show loading state
          <>
            <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
          </>
        ) : (
          btnType3 // Display Save button label
        )}

      </button>

      {/* Reset Button */}
      {!showUpdate  && ( // Show Reset button only if there are input values
        <button
          tabIndex="1"
          type="button"
          name="reset"
          className="btn btn-warning btn-color ms-2  btn-sm"
          onClick={onReset} // Call the reset function
        >
          {btnType5}
        </button>
      )}

      {/* Back Button */}
      {showUpdate && (
        <button
          tabIndex="1"
          type="button"
          name="back"
          className="btn btn-secondary btn-color ms-2  btn-sm"
          onClick={onBack} // Call the back function
        >
          {btnType4}
        </button>
      )}
    </>
  );
};

export default FormButton;
