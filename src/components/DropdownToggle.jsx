import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/DropdownToggle.css"; // Ensure the path is correct
import icon from "../properties/icon.js";
import Cookies from "js-cookie";
import config from "../properties/config.js";
import {
  retrieveFromLocalStorage,
  retrieveFromCookies,
  storeInLocalStorage,
  storeInCookies,
} from "../utils/CryptoUtils";
import useKeyboardShortcut from "../hooks/useKeyboardShortcut.jsx";

const DropdownToggle = ({ setShowModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [quickLinks, setQuickLinks] = useState(false);
  const dropdownRef = useRef(null); // Reference for the dropdown
  let uDataCookie = retrieveFromCookies("uData");
  const uData = uDataCookie ? JSON.parse(uDataCookie) : {};
  const userStatus = uData.userStatus || "NoUser";
  const userName = uData.userName;
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  useKeyboardShortcut(
    "P",
    () => {
      const toggleDropD = document.getElementById("toggleDropDown");
      if (toggleDropD) {
        toggleDropD.click();
        if (!isOpen) {
          toggleDropD.focus();
        } else {
          toggleDropD.blur();
        }
      }
    },
    { alt: true }
  );

  useKeyboardShortcut(
    "D",
    () => {
      if (quickLinks) {
        if (
          window.confirm("Are you sure you want to change Department and Role?")
        ) {
          let uDataCookie = retrieveFromCookies("uData");
          const uData = uDataCookie ? JSON.parse(uDataCookie) : {};

          storeInCookies("tempUData", JSON.stringify(uData));

          Cookies.remove("userDptRole");
          Cookies.remove("userDetId");

          localStorage.removeItem("menuPath");
          storeInLocalStorage("activeMenuId", "deptRole");
          navigate(config.baseUrl);
        } else {
        }
      } else {
        alert("You are Logged in as Admin (प्रशासन)!!!");
      }
    },
    { alt: true, shift: true }
  );

  const handleClickOutside = (event) => {
    // Check if the click was outside of the dropdownRef
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false); // Close the dropdown
    }
  };

  useEffect(() => {
    // Add event listener to handle clicks outside of dropdown
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Clean up the event listener on unmount
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // UseEffect to handle side effect logic like cookie checking
  useEffect(() => {
    // Retrieve uData from cookies
    const uDataCookie = retrieveFromCookies("uData");
    const uData = uDataCookie ? JSON.parse(uDataCookie) : {}; // Parse uData from cookie, or default to an empty object

    // Check userStatus and set quickLinks accordingly
    if (uData.userStatus === "U") {
      setQuickLinks(true); // Set quickLinks to true if the userStatus is "U"
    }
  }, []);

  const linkRef = useRef(null); // Create a ref to access the DOM element

  useEffect(() => {
    // Ensure focus is applied when the component is mounted
    if (linkRef.current) {
      linkRef.current.focus();
    }
  }, []);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={toggleDropdown}
        className="borderDrop"
        id="toggleDropDown"
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/149/149071.png" // User image URL
          alt="User"
          className="profile-image"
          data-bs-toggle="tooltip"
          data-bs-placement="auto"
          title="View the Profile"
        />
      </button>
      {isOpen && (
        <div
          ref={dropdownRef} // Attach ref here
          style={{
            position: "absolute",
            background: "#fff",
            border: "1px solid #ccc",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            marginTop: "11px",
            right: "-93px",
            padding: "12px",
          }}
        >
          <div class="profile-card">
            <img
              src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
              alt="User Profile Picture"
            />
            <div class="user-info">
              <h2>{userName}</h2>

              <div style={{ border: "1px solid grey" }} className="mt-3">
                <div className="loginTime row mx-2 ">
                  <span>
                    <b>Login Time</b>{" "}
                  </span>
                </div>
                <div className="loginTime row ms-3 mx-2">
                  {retrieveFromLocalStorage("loginTime")}
                </div>
              </div>
            </div>
            <div>
              <NavLink
                ref={linkRef} // Attach the ref to the NavLink element
                to={config.baseUrl}
                style={({ isActive }) => ({
                  color: isActive ? "blue" : "black",
                  textDecoration: "none",
                })}
                onClick={(e) => {
                  localStorage.removeItem("menuPath");
                  storeInLocalStorage("activeMenuId", "themeChangepage");
                }}
              >
                <i className={icon.setting}></i> &nbsp; Change Themes 📺
              </NavLink>
            </div>
            <div>
              <NavLink
                ref={linkRef} // Attach the ref to the NavLink element
                to={config.baseUrl}
                style={({ isActive }) => ({
                  color: isActive ? "blue" : "black",
                  textDecoration: "none",
                })}
                onClick={(e) => {
                  e.preventDefault();
                  setShowModal(true);
                }}
              >
                {/* <i className={icon.list}></i>  */}
                 &nbsp; Help ℹ️
              </NavLink>
            </div>
            {quickLinks && (
              <div className="my-2">
                <NavLink
                  to={config.apiBaseUrl}
                  style={({ isActive }) => ({
                    color: isActive ? "blue" : "black",
                    textDecoration: "none",
                  })}
                  onClick={(e) => {
                    // e.preventDefault(); // Prevent the default navigation behavior
                    localStorage.removeItem("menuPath");
                    storeInLocalStorage("activeMenuId", "quicklinks"); // Store the active menu ID in localStorage
                  }}
                >
                  <i className={icon.setting}></i> &nbsp; Add To Favorite's 💗
                </NavLink>
              </div>
            )}

            {quickLinks && (
              <div className="my-2">
                <NavLink
                  to={config.apiBaseUrl}
                  style={({ isActive }) => ({
                    color: isActive ? "blue" : "black",
                    textDecoration: "none",
                  })}
                  onClick={(e) => {
                    // e.preventDefault(); // Prevent the default navigation behavior

                    let uDataCookie = retrieveFromCookies("uData");
                    const uData = uDataCookie ? JSON.parse(uDataCookie) : {};

                    storeInCookies("tempUData", JSON.stringify(uData));

                    Cookies.remove("userDptRole");
                    Cookies.remove("userDetId");

                    localStorage.removeItem("menuPath");
                    storeInLocalStorage("activeMenuId", "deptRole"); // Store the active menu ID in localStorage
                  }}
                >
                  <i className={icon.setting}></i> &nbsp; Change Department &
                  Role
                </NavLink>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownToggle;
