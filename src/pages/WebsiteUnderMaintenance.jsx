import "../styles/WebsiteUnderMaintenance.css";
import React from "react";
import Cookies from "js-cookie";
import {
  retrieveFromLocalStorage,
  retrieveFromCookies,
  storeInLocalStorage,
} from "../utils/CryptoUtils";
import { useNavigate } from "react-router-dom";
import config from "../properties/config";

import logo from "../../public/img/h-logo.png";

const WebsiteUnderMaintenance = () => {
  const navigate = useNavigate();

  return (
    <div className="WebsiteUnderMaintenance-container">
      <div className="WebsiteUnderMaintenance-content">
        <div className="text-container">
          <img
            src={logo}
            alt="Under Maintenance"
            className="WebsiteUnderMaintenance-icon mb-3"
          />
          <div className="maintenance-text">Website Under Maintenance!!</div>
          <div className="sub-text">
          Our Service is currently undergoing scheduled maintenance.
          </div>
          <div className="sub-text">
          We should be back shortly. Thank you for your patience..
          </div>
          <button
            className="maintenance-button"
            onClick={(e) => {
              e.preventDefault();
              Cookies.remove("AESDecKey");
                        Cookies.remove("publicIp");
                        Cookies.remove("token");
                        Cookies.remove("userDetId");
                        Cookies.remove("userDptRole");
                        Cookies.remove("uData");
                        Cookies.remove("menuPath");
                        localStorage.clear();
            }}
          >
            Re-Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default WebsiteUnderMaintenance;
