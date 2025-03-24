import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import "../styles/ThemeChangePage.css"; // Import your styles here

import { getSave } from "../utils/api";
import ErrorMessageABD from "./ErrorMessageABD";
import useCheckResponseStatus from "../hooks/useCheckResponseStatus";
import blue from "../../public/img/blue.png";
import green from "../../public/img/green.png";
import grey from "../../public/img/grey.png";
import red from "../../public/img/red.png";
import ocean from "../../public/img/ocean.png";
import hotpink from "../../public/img/hotpink.png";
import config from "../properties/config";
import { NavLink } from "react-router-dom";
import icon from "../properties/icon";
import {
  retrieveFromLocalStorage,
  retrieveFromCookies,
  storeInLocalStorage,
  storeInCookies,
} from "../utils/CryptoUtils";

const themes = [
  { id: 1, name: "Minted Gold", image: green, theme: "default" },
  { id: 2, name: "Rose Quartz", image: hotpink, theme: "theme6" },
  { id: 3, name: "Dark Mode", image: grey, theme: "theme2" },
  { id: 4, name: "Maven Red", image: red, theme: "theme3" },
  { id: 5, name: "Platinum Horizon", image: ocean, theme: "theme4" },
  { id: 6, name: "Royal Illusion", image: blue, theme: "theme1" },
];

const ThemeChangePage = () => {
  const { checkResponseStatus } = useCheckResponseStatus();
  const [errorVisibleComponent, setErrorMessageVisibleComponent] = useState(false);
  const [errorType, setErrorType] = useState();
  const [errorDivMessage, setErrorDivMessage] = useState("");
  const secretKey = retrieveFromCookies("AESDecKey");
  const [selectedThemeId, setSelectedThemeId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [s_userId, setS_UserId] = useState({ userId: "", publicIp: "" });
  const [theme, setTheme] = useState("");
  const [userDataNew, setUserDataNew] = useState("no");

  useEffect(() => {
    const publicIp = retrieveFromCookies("publicIp") || "";
    const uDataCookie = retrieveFromCookies("uData");
    const uData = uDataCookie ? JSON.parse(uDataCookie) : {};
    const userId = uData.userId || "NoUser";
    setUserDataNew(JSON.parse(uDataCookie));
    const cookieTheme = uData.dbTheme || "default";
    setTheme(cookieTheme);
    setSelectedThemeId(themes.find((t) => t.theme === cookieTheme)?.id);
    setSelectedImage(themes.find((t) => t.theme === cookieTheme)?.image);
    setS_UserId({ userId, publicIp });
  }, []);

  const handleThemeChange = async (themeSelected) => {
    const variable = {
      userId: s_userId.userId,
      publicIp: s_userId.publicIp,
      theme: themeSelected.theme,
    };
    const ciphertext = encAESData(secretKey, variable);
    const response = await getSave("admin", "theme", ciphertext);
    const responseData = checkResponseStatus(response);
    if (responseData) {
      const jsonData = JSON.parse(responseData.rData);
      const decryptedData = decAESData(secretKey, jsonData);
      if (responseData.rType === "Y") {
        setSelectedThemeId(themeSelected.id);
        setSelectedImage(themeSelected.image);
        const updatedUserData = {
          ...userDataNew,
          dbTheme: themeSelected.theme,
        };
        storeInCookies("uData", JSON.stringify(updatedUserData));
        window.location.reload();
        setErrorMessageVisibleComponent(true);
        setErrorType(true);
        setErrorDivMessage("Theme Updated Successfully");
        setTimeout(() => setErrorMessageVisibleComponent(false), 5000);
      } else {
        setErrorMessageVisibleComponent(true);
        setErrorType(false);
        setErrorDivMessage(responseData.rMessage);
      }
    }
  };

  return (
    <>
      <div className="rightArea">
        <div className="row">
          <div className="col-12">
            <ol className="breadcrumb modern-breadcrumb mx-3">
              <li className="breadcrumb-item pe-auto">
                <div
                  onClick={(e) => {
                    e.preventDefault(); // Prevent the default navigation behavior
                    storeInLocalStorage("activeMenuId", "dashboard");
                  }}
                  className="nav-link sub-link"
                  to={config.baseUrl}
                >
                  <i className={icon.house}></i>
                  <span className="ms-2">Dashboard</span>
                </div>
              </li>

              <li className="breadcrumb-item">
                <span className="breadcrumb-text">User Details</span>
              </li>
              <li className="breadcrumb-item">
                <span className="breadcrumb-text">Theme Change Page</span>
              </li>
            </ol>
          </div>
        </div>

        <div className="theme-change-container">
          <p className="h2">Select a Theme</p>

          <h3 className="selected-theme-text">
            {/* Selected Theme: {selectedThemeId ? `Theme ${selectedThemeId}` : "None"} */}
          </h3>
          {selectedImage && (
            <img
              src={selectedImage}
              alt={`Selected ${selectedThemeId}`}
              className="selected-theme-image"
            />
          )}

          <div className="row">
            {themes.map((theme) => (
              <div
                className="col-12 col-sm-6 col-md-4 col-lg-3 p-2 mb-2"
                key={theme.id}
                tabIndex="0"
              >
                <div
                  key={theme.id}
                  className={`theme-card ${
                    selectedThemeId === theme.id ? "selected" : ""
                  }`}
                  onClick={() => handleThemeChange(theme)}
                >
                  <img
                    src={theme.image}
                    alt={theme.name}
                    className="img-thumbnail themesPhotos"
                  />
                  <h3>{theme.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="error-container">
          <ErrorMessageABD
            text={errorDivMessage}
            isSuccess={errorType}
            isVisible={errorVisibleComponent}
            setVisible={setErrorMessageVisibleComponent}
          />
        </div>
      </div>
    </>
  );
};

export default ThemeChangePage;
