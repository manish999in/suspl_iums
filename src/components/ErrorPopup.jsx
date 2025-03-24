import React, { useState } from 'react';
import { retrieveFromLocalStorage, retrieveFromCookies, storeInCookies, storeInLocalStorage } from "../utils/CryptoUtils";
import { useNavigate } from 'react-router-dom';
import config from '../properties/config';

const ErrorPopup = () => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();


  const handleGoBack = () => {
    storeInLocalStorage("activeMenuId", "dashboard");
    navigate(config.baseUrl);
  };

  const errorContainerStyle = {
    position: 'fixed',
    top: '-30px',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '1000',
    visibility: 'visible',
    opacity: '1',
    transition: 'visibility 0s 0.3s, opacity 0.3s ease',
  };

  const errorMessageStyle = {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    maxWidth: '400px',
    width: '100%',
    boxSizing: 'border-box',
    display: 'block',
  };

  const errorHeadingStyle = {
    color: 'red',
    marginBottom: '15px',
  };

  const errorTextStyle = {
    fontSize: '18px',
    marginBottom: '20px',
  };

  const buttonStyle = {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: '5px',
    transition: 'background-color 0.3s',
  };

  const buttonHoverStyle = {
    backgroundColor: '#0056b3',
  };

  return (
    <>
      {isVisible && (
        <div style={errorContainerStyle}>
          <div style={errorMessageStyle}>
            <h1 style={errorHeadingStyle}>Error Occurred!</h1>
            <p style={errorTextStyle}>Something went wrong. Please try again later.</p>
            <button 
              style={buttonStyle} 
              onClick={handleGoBack}
              onMouseOver={(e) => e.target.style.backgroundColor = buttonHoverStyle.backgroundColor} 
              onMouseOut={(e) => e.target.style.backgroundColor = buttonStyle.backgroundColor}
            >
              Go Back to Home Page
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ErrorPopup;
