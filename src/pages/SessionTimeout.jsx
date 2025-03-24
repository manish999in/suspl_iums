// src/pages/SessionTimeout.jsx
import React, { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons"; // Adding clock icon
import "../styles/SessionTimeout.css"; // Import CSS for styling
import Cookies from "js-cookie";

const SessionTimeout = () => {
  // Clear cookies and localStorage
  const homeLinkRef = useRef(null);

  useEffect(() => {
    // This effect will focus the home link after the page is loaded or the component is mounted
    if (homeLinkRef.current) {
      homeLinkRef.current.focus();
    }
  }, []);

  return (
    <div className="session-timeout-container">
      <div className="session-timeout-content">
        <FontAwesomeIcon icon={faClock} className="session-timeout-icon" />
        <h1 className="session-timeout-title">Session Timeout</h1>
        <p className="session-timeout-message">
          Your session has expired due to inactivity. Please log in again to
          continue.
        </p>
        <a
          href="/suspl-iums"
          className="session-timeout-home-link"
          onClick={(e) => {
            e.preventDefault(); // Prevent default link behavior
            Cookies.remove("token");
            Cookies.remove("publicIp");
            Cookies.remove("uData");
            Cookies.remove("AESDecKey");
            Cookies.remove("tempUData");
            Cookies.remove("menuPath");
            localStorage.clear();

            // After the cleanup, focus the link
            if (homeLinkRef.current) {
              homeLinkRef.current.focus();
            }
          }}
          ref={homeLinkRef} // Attach the ref to the anchor tag
          tabIndex="0" // Ensures the element is focusable
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default SessionTimeout;
