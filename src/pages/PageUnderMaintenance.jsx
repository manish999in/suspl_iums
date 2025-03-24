import "../styles/PageUnderMaintenance.css";
import React from "react";
import Cookies from "js-cookie";
import {
  retrieveFromLocalStorage,
  retrieveFromCookies,
  storeInLocalStorage,
} from "../utils/CryptoUtils";
import { useNavigate } from "react-router-dom";
import config from "../properties/config";

const PageUnderMaintenance = () => {
  const navigate = useNavigate();

  return (
    <div className="PageUnderMaintenance-container">
      <div className="PageUnderMaintenance-content">
        <div className="text-container">
          <img
            src="https://img.icons8.com/ios/452/maintenance.png"
            alt="Under Maintenance"
            className="maintenance-icon mb-3"
          />
          <div className="maintenance-text">
            {retrieveFromLocalStorage("pageName")}
          </div>
          <div className="maintenance-text">Page Under Maintenance</div>
          <div className="sub-text">
            We are working hard to improve your experience!
          </div>
          <button
            className="maintenance1-button"
            onClick={(e) => {
              e.preventDefault();
              Cookies.remove("menuPath");
              storeInLocalStorage("activeMenuId", "dashboard");
              navigate(config.baseUrl);
            }}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageUnderMaintenance;
