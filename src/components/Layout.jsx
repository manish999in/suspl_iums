import React, { useEffect, useState, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { privateAxios, API_ENDPOINTS } from "../utils/api";
import { faPowerOff } from "@fortawesome/free-solid-svg-icons"; // Import the power-off icon
import config from "../properties/config";
import Cookies from "js-cookie";
import headerLogo from "../../public/img/h-logo.png";
import { Button } from 'react-bootstrap'; // Ensure Button is imported

import {
  faMoneyBill,
  faIdBadge,
  faBuilding,
  faBalanceScale,
  faBank,
  faCalendar,
  faBook,
  faCreditCard,
  faShoppingCart,
  faFileAlt,
  faUserPlus,
  faGraduationCap,
  faBars,
} from "@fortawesome/free-solid-svg-icons";

import Loading from "./Loading";
import useCheckResponseStatus from "../hooks/useCheckResponseStatus";
import DropdownToggle from "./DropdownToggle";
import TreeMenu from "./TreeMenu";

import {
  retrieveFromLocalStorage,
  retrieveFromCookies,
  storeInLocalStorage,
} from "../utils/CryptoUtils";
import useKeyboardShortcut from "../hooks/useKeyboardShortcut";
import ShortcutModal from "./ShortcutModal";
import CalculatorModal from "./CalculatorModal";

const Layout = ({ children, onThemeChange }) => {

  const [isCalculatorModalOpen, setCalculatorIsModalOpen] = useState(false);

  const openModal = () => setCalculatorIsModalOpen(true);
  const closeModal = () => setCalculatorIsModalOpen(false);

  useKeyboardShortcut(
    "d",
    () => {
      if (window.confirm(
        "Are you sure you want to navigate to Dashboard?"
      )) {
        var textField = document.getElementById("searchInput");

        // Clear the text field by setting its value to an empty string
        textField.value = "";

        Cookies.remove("menuPath");
        storeInLocalStorage("activeMenuId", "dashboard");
        navigate(config.baseUrl);

      }

    },
    { ctrl: true , shift: false }
  );

  useKeyboardShortcut(
    "L",
    () => {
      const logout = document.getElementById("logout");
      if (logout) {
        logout.focus();
      }
    },
    { ctrl: true }
  );

  useKeyboardShortcut(
    "L",
    () => {
      const logout = document.getElementById("logout");
      if (logout) {
        logout.focus();
        logout.click();
      }
    },
    { ctrl: true, shift: true } // Add shift modifier
  );

  useKeyboardShortcut(
    "T",
    () => {
      const HideShowSidebar = document.getElementById("HideShowSidebar");
      if (HideShowSidebar) {
        HideShowSidebar.click();
      }
    },
    { alt: true }
  );

  const focusOnFirstTabIndex = () => {
    const element = document.querySelector('[tabindex="1"]');
    if (element) {
      element.focus();
    }
  };

  // Use the custom hook for Shift + ArrowRight key combination
  useKeyboardShortcut("ArrowRight", focusOnFirstTabIndex, { ctrl: true });

  const [showModal, setShowModal] = useState(false);


  // Open and close modal for keyboard shortcuts
  const handleCloseModal = () => setShowModal(false);

  // Listen for F2 key to open modal
  useKeyboardShortcut("F2", () => {
    if(showModal){
      setShowModal(false);
    }else{
      setShowModal(true);
    }

  });


  useKeyboardShortcut(
    "X",
    () => {
      if(isCalculatorModalOpen){
        setCalculatorIsModalOpen(false);
      }else{
        setCalculatorIsModalOpen(true);
      }
    },
    { alt: true }
  );



  //"""""""""""""""""""" REDIRECTS back to dashboard on REFRESH"""""""""""""""""""""""""""""""""""""""""""""""""""//

  // now this is not working to enable it clear menuid from the localstorage
  useEffect(() => {
    // console.log(retrieveFromCookies("uData"),"----------------");

    if (retrieveFromLocalStorage("rfshfg") == "n") {
      storeInLocalStorage("rfshfg", "y");
      window.location.reload();
    }

    // Redirect to the base URL when the component is mounted
    if (window.location.pathname !== "/suspl-iums") {
      navigate(config.baseUrl);
    }
  }, []); // Empty dependency array means this runs only on mount

  //"""""""""""""""""""" REDIRECTS back to dashboard on REFRESH"""""""""""""""""""""""""""""""""""""""""""""""""""//

  function getFormattedDateTime() {
    const now = new Date();

    // Get hours, minutes, seconds
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    // Determine AM or PM
    const period = hours >= 12 ? "PM" : "AM";

    // Convert to 12-hour format
    hours = hours % 12 || 12; // 0 should become 12 for 12 AM

    // Get day, month, year
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = now.getFullYear();

    // Format: hh:mm:ss AM/PM ~ dd-mm-yyyy
    const formattedDateTime = `${day}-${month}-${year} ~ ${hours}:${minutes}:${seconds} ${period}`;

    return formattedDateTime;
  }

  if (!retrieveFromLocalStorage("loginTime")) {
    storeInLocalStorage("loginTime", getFormattedDateTime());
  }

  //"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

  const [theme, setTheme] = useState("");
  const [currentStyle, setCurrentStyle] = useState(theme);

  const { checkResponseStatus } = useCheckResponseStatus();
  const [loading, setLoading] = useState(false);

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const navigate = useNavigate();

  const [islogout, setLogout] = useState(false);


  const [userId, setUserId] = useState("Guest");


  const secretKey = retrieveFromCookies("AESDecKey");

  useEffect(() => {
    const publicIp = retrieveFromCookies("publicIp") || "";
    const uDataCookie = retrieveFromCookies("uData");
    const uData = uDataCookie ? JSON.parse(uDataCookie) : {};
    const userId = uData.userId || "NoUser";
    setUserId(userId);
  }, []);

  const [rcds, setRcds] = useState({
    userId: userId,
  });

  useEffect(() => {
    const uDataCookie = retrieveFromCookies("uData");

    const userData = JSON.parse(uDataCookie);
    setTheme(userData.dbTheme);

    // useEffect(() => {
    const loadStyle = async () => {
      try {
        await import(`../themes/${theme}.css`);
        setCurrentStyle(theme);
      } catch { }
    };
    loadStyle();
  }, [theme]);

  const logout = async () => {
    const confirm = window.confirm("Are you sure you want to Logout?");
    if (!confirm) {
    } else {
      setLogout(true);
      try {
        // changes
        const ciphertext = encAESData(secretKey, { userId });
        console.log("Encrypted Data: ", ciphertext);
        const response = await privateAxios.post(API_ENDPOINTS.logout, {
          encData: ciphertext,
        });

        const responseData = checkResponseStatus(response);

        if (responseData.rType === "Y") {
          Cookies.remove("AESDecKey");
          Cookies.remove("publicIp");
          Cookies.remove("token");
          Cookies.remove("userDetId");
          Cookies.remove("userDptRole");
          Cookies.remove("uData");
          Cookies.remove("menuPath");
          localStorage.clear();
          storeInLocalStorage("activeMenuId", "loginMessage");
          // navigate(config.baseUrl);
        } else {
          console.error("Logout failed:", response.data.message);
        }
      } catch (error) {
        console.error("Error during logout:", error);
      } finally {
        setLogout(false);
      }
    }
  };

  useEffect(() => {
    // Hide sidebar initially on mobile view
    if (window.innerWidth < 768) {
      setIsSidebarVisible(false);
    }
  }, []);

  if (loading) {
    return <Loading />;
  }


  

  return (
    <div
      className={`layout ${isSidebarVisible ? "with-sidebar" : "without-sidebar"
        } ${theme}`} // Add theme class here
    >
      <header className="header">
        <button

          className="toggle-button"
          onClick={() => setIsSidebarVisible(!isSidebarVisible)}
          aria-label="Toggle sidebar"
          data-bs-toggle="tooltip"
          data-bs-placement="auto"
          title="Hide/Show Sidebar {Shift + T}"
          id="HideShowSidebar"
        >
          <FontAwesomeIcon icon={faBars} className="bar-icon" />
        </button>
        <NavLink


          onClick={(e) => {
            // e.preventDefault(); // Prevent the default navigation behavior

        Cookies.remove("menuPath");


            storeInLocalStorage("activeMenuId", "dashboard");
          }}
          className="nav-link sub-link"
          to={config.baseUrl}
          activeclassname="active" // This class will be added when the link is active
        >
          <img
            src={headerLogo}
            alt="logo"
            className="header-logo"
            data-bs-toggle="tooltip"
            data-bs-placement="auto"
            title="Go To Dashboard {Ctrl + D}"
          />{" "}
        </NavLink>

        <div className="header-left">
          {/*  <div className="header-text"> */}
          {/* <h5 className="sub-heading mobileView">{config.headerTitle}</h5> */}
          {/* </div>*/}
        </div>

        {/* <div className="loginTime" style={{ marginLeft: '38%' }}>
          <span><b>Login Time  -- </b> </span>
          {localStorage.getItem("loginTime")}
        </div> */}
        <div className="header-icons">
          <DropdownToggle setShowModal={setShowModal} />

          <button
            onClick={!islogout ? logout : null}
            className="logout-button"
            disabled={islogout}
            aria-label="Logout"
            data-bs-toggle="tooltip"
            data-bs-placement="auto"
            title="Click To Exit {Ctrl + L / Ctrl + Shift + L}"
            tabIndex="0"
            id="logout"
          >
            {islogout ? (
              <span>Logging out...</span>
            ) : (
              <>
                <FontAwesomeIcon icon={faPowerOff} /> Logout
              </>
            )}
          </button>
        </div>
      </header>
      <aside className={`sidebar ${isSidebarVisible ? "visible" : "hidden"}`}>
        <TreeMenu
          isSidebarVisible={isSidebarVisible}
          setIsSidebarVisible={setIsSidebarVisible}
          setLoading={setLoading}
        />
      </aside>

      <main
        className={`main-content ${isSidebarVisible ? "sidebar-visible" : "sidebar-hidden"
          }`}
      >
        {children}
      </main>
      <footer className="footer">
        <span>{config.footerText}</span>
      </footer>


      {/* Shortcut Modal */}
      <ShortcutModal show={showModal} onClose={handleCloseModal} />
      <CalculatorModal isOpen={isCalculatorModalOpen} closeModal={closeModal} />
    </div>
  );
};

export default Layout;
