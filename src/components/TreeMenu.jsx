import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { API_ENDPOINTS } from "../utils/api";

import { faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons";
import useCheckResponseStatus from "../hooks/useCheckResponseStatus";
import icon from "../properties/icon";
import { faTimes } from "@fortawesome/free-solid-svg-icons"; // Importing the clear (X) icon

import {
  retrieveFromLocalStorage,
  retrieveFromCookies,
  storeInLocalStorage,
  storeInCookies,
} from "../utils/CryptoUtils";
import config from "../properties/config";
import useKeyboardShortcut from "../hooks/useKeyboardShortcut";
const secretKey = retrieveFromCookies("AESDecKey");
const TreeMenu = ({ setIsSidebarVisible, setLoading }) => {

  const [activeChildMenu, setActiveChildMenu] = useState(null);
  const [treeData, setTreeData] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // added for searching
  const { checkResponseStatus } = useCheckResponseStatus();
  const [activeMenu, setActiveMenu] = useState(null);
  const [openSubMenu, setOpenSubMenu] = useState({});
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useKeyboardShortcut(
    "k",
    () => {
      const searchInput = document.getElementById("searchInput");
      if (searchInput) {
        searchInput.focus();
      }
    },
    { ctrl: true }
  );


  useKeyboardShortcut(
    "ArrowLeft",
    () => {
      const focusableElement = document.querySelector("#searchInput"); // Use the input's ID
      if (focusableElement) {
        focusableElement.focus();
      }
    },
    { ctrl: true }
  );
  
  const clearSearch = () => {
    setSearchTerm(""); // Clear the search term
  };

  // Create a ref to store clearSearch function
  const clearSearchRef = useRef(() => {});

  // Assign the clearSearch function to the ref
  useEffect(() => {
    clearSearchRef.current = clearSearch;
  }, [clearSearch]);

  // Handle key press for keyboard shortcut
  const handleKeyDown = (event) => {
    if (event.key === "k" && event.ctrlKey && event.shiftKey) {
      clearSearchRef.current(); // Call the function stored in the ref
    }

    clearSearchRef.current();
  };

  // Use the keyboard shortcut hook (make sure it's defined somewhere)
  useKeyboardShortcut(
    "k", // key to trigger
    () => {
      clearSearchRef.current(); // Call the function from useRef
    },
    { ctrl: true, shift: true } // Require Ctrl + Shift
  );

  //added for searching
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const getTreeMenu = () => {
    try {
      let uDataCookie = retrieveFromCookies("uData");
      const uData = uDataCookie ? JSON.parse(uDataCookie) : {};
      const userStatus = uData.userStatus || "NoUser";

      if (userStatus === "A") {
        const fetchData = async () => {
          const userId = "ADMIN"; // Set your userId here
          const requestBody = {
            userId: userId,
          };

          setLoading(true);
          const token = retrieveFromCookies("token");

          // Check if the token exists before making the API call
          if (!token) {
            setError("No token found. Please log in.");
            setLoading(false);
            return;
          }

          // console.log("Token:", token); // Log token to check if it's being received correctly

          // Encrypt request body (assume encAESData is your encryption function)
          const ciphertext = encAESData(secretKey, requestBody);
          const cipherJson = {
            encData: ciphertext,
          };

          // Make the API request
          const response = await fetch(API_ENDPOINTS.treeMenu, {
            method: "POST", // Change to GET if your API expects GET requests
            headers: {
              Authorization: `Bearer ${token}`, // Add the token in the Authorization header
              "Content-Type": "application/json", // Set the content type
            },
            body: JSON.stringify(cipherJson), // Send encrypted data in the body
          });

          // Check for unsuccessful responses
          if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();

          checkResponseStatus(data);

          if (data.rData) {
            // Decrypt response data (assume decAESData is your decryption function)
            const recJson = JSON.parse(data.rData);
            const decryptedData = decAESData(secretKey, recJson);

            setTreeData(decryptedData.recData || []);
          }
        };
        fetchData(); // Call the fetchData function
      } else if (userStatus === "U") {
        const fetchData = async () => {
          let uDataCookie = retrieveFromCookies("tempUData");
          const uData = uDataCookie ? JSON.parse(uDataCookie) : {};
          const userType = uData.userType || "EM";
          const userStatus = uData.userStatus || "U";
          const userId = uData.userId;
          const userDetId = retrieveFromCookies("userDetId");
          const secretKey = retrieveFromCookies("AESDecKey");
          const token = retrieveFromCookies("token");

          const requestBody = {
            userDetId: userDetId,
            userType: userType,
            userStatus: userStatus,
            userId: userId,
          };

          const ciphertext = encAESData(secretKey, requestBody);
          const cipherJson = {
            encData: ciphertext,
          };

          const response = await fetch(API_ENDPOINTS.treeMenuSQ, {
            method: "POST", // Change to GET if your API expects GET requests
            headers: {
              Authorization: `Bearer ${token}`, // Add the token in the Authorization header
              "Content-Type": "application/json", // Set the content type
            },
            body: JSON.stringify(cipherJson), // Send encrypted data in the body
          });

          if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();

          checkResponseStatus(data);

          if (data.rData) {
            // Cookies.set("uData", uData);
            // Decrypt response data (assume decAESData is your decryption function)
            const recJson = JSON.parse(data.rData);
            const decryptedData = decAESData(secretKey, recJson);

            // Update the treeData state with the decrypted data
            // setTreeData(data.rData.recData || []);
            setTreeData(decryptedData.recData || []);
          }
        };
        fetchData();
      }
      setLoading(false);
    } catch {}
  };

  useEffect(() => {
    getTreeMenu();
  }, []);

  const handleMenuClick = (menuId) => {
    setActiveMenu((prev) => (prev === menuId ? null : menuId));
  };

  const handleSubMenuClick = (menuId) => {
    setOpenSubMenu((prevState) => ({
      ...prevState,
      [menuId]: !prevState[menuId],
    }));
  };

  const hasChildren = (menuId) => {
    return treeData.some((item) => item.parent_id === menuId);
  };

  const prevMenuPath = useRef(null);

  const renderSubMenu = (menuItem, data) => {
    return (
      <ul className="submenu">
        {data
          .filter(
            (subMenu) =>
              subMenu.parent_id === menuItem.menu_Id && menuItem.menu_Id > 0
          )
          .map((subMenu) => {
            const isSubMenuOpen = openSubMenu[subMenu.menu_Id];
            const isPage = activeChildMenu === subMenu.menu_Id;

            return (
              <li
                key={subMenu.menu_Id}
                className={`submenu-item ${isPage ? "page-item" : ""}`}
              >
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubMenuClick(subMenu.menu_Id);
                    setActiveChildMenu(subMenu.menu_Id);

                    // alert(subMenu.menu_Id);

                    const menuPath = retrieveFromCookies("menuPath");

                    if (subMenu.jspFile === prevMenuPath.current && menuPath) {
                      return;
                    } else {
                      if (subMenu.noSubMenu === 0) {
                        storeInLocalStorage("activeMenuId", subMenu.menu_Id); // Store active menu ID
                        storeInCookies("menuPath", subMenu.jspFile);
                        storeInLocalStorage("pageName", subMenu.menuPrompt);
                        // setSearchTerm("");

                        prevMenuPath.current = subMenu.jspFile;

                        navigate(config.baseUrl);
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSubMenuClick(subMenu.menu_Id);
                      const menuPath = retrieveFromCookies("menuPath");

                      if (
                        subMenu.jspFile === prevMenuPath.current &&
                        menuPath
                      ) {
                        return;
                      } else {
                        if (subMenu.noSubMenu === 0) {
                          storeInLocalStorage("activeMenuId", subMenu.menu_Id);
                          storeInCookies("menuPath", subMenu.jspFile); // Store active menu ID
                          storeInLocalStorage("pageName", subMenu.menuPrompt);

                          // setSearchTerm("");

                          prevMenuPath.current = subMenu.jspFile;

                          navigate(config.baseUrl);
                        }
                      }
                    } else {
                      // e.preventDefault();
                    }
                  }}
                  className={`submenu-title ${isPage ? "bold" : ""}`}
                  tabIndex="0"
                >
                  <i className={`icon-class ${icon.clipboard} menu-icon`} />
                  <span className="menu-text">{subMenu.menuPrompt}</span>
                  {hasChildren(subMenu.menu_Id) && (
                    <FontAwesomeIcon
                      icon={isSubMenuOpen ? faAngleUp : faAngleDown}
                      className="dropdown-icon"
                    />
                  )}
                </div>

                {isSubMenuOpen &&
                  hasChildren(subMenu.menu_Id) &&
                  renderSubMenu(subMenu, data)}
              </li>
            );
          })}
      </ul>
    );
  };

  const renderParentMenu = (data) => {
    return data
      .filter((menuItem) => menuItem.parent_id === 0 && menuItem.menu_Id > 0)
      .map((menuItem) => {
        const hasSubMenu = treeData.some(
          (subMenu) => subMenu.parent_id === menuItem.menu_Id
        );
        return (
          <li
            key={menuItem.menu_Id}
            className={`menu-item ${
              activeMenu === menuItem.menu_Id ? "active" : ""
            }`}
          >
            <div
              onClick={() => handleMenuClick(menuItem.menu_Id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleMenuClick(menuItem.menu_Id); // Toggle submenu
                }
              }}
              className="menu-title"
              tabIndex="0" // Add tabindex for accessibility
            >
              <i className={`icon-class ${icon.bell} menu-icon`} />
              <span className="menu-text">{menuItem.menuPrompt}</span>
              {hasSubMenu && (
                <FontAwesomeIcon
                  icon={
                    activeMenu === menuItem.menu_Id ? faAngleUp : faAngleDown
                  }
                  className="dropdown-icon"
                />
              )}
            </div>
            {activeMenu === menuItem.menu_Id &&
              hasSubMenu &&
              renderSubMenu(menuItem, data)}
          </li>
        );
      });
  };

  const renderSubMenuSearch = (menuItem, data) => {
    return (
      <ul className="submenu">
        {data
          .filter(
            (subMenu) =>
              subMenu.parent_id === menuItem.menu_Id && menuItem.menu_Id > 0
          )
          .map((subMenu) => {
            const isSubMenuOpen = openSubMenu[subMenu.menu_Id];
            const isPage = activeChildMenu === subMenu.menu_Id;

            return (
              <li
                key={subMenu.menu_Id}
                className={`submenu-item ${isPage ? "page-item" : ""}`}
              >
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubMenuClick(subMenu.menu_Id);
                    setActiveChildMenu(subMenu.menu_Id);

                    const menuPath = retrieveFromCookies("menuPath");

                    if (subMenu.jspFile === prevMenuPath.current && menuPath) {
                      return;
                    } else {
                      if (subMenu.noSubMenu === 0) {
                        storeInCookies("menuPath", subMenu.jspFile);
                        storeInLocalStorage("activeMenuId", subMenu.menu_Id); // Store active menu ID
                        storeInLocalStorage("pageName", subMenu.menuPrompt);

                        // setSearchTerm("");

                        prevMenuPath.current = subMenu.jspFile;

                        navigate(config.baseUrl);
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSubMenuClick(subMenu.menu_Id);
                      const menuPath = retrieveFromCookies("menuPath");

                      if (
                        subMenu.jspFile === prevMenuPath.current &&
                        menuPath
                      ) {
                        return;
                      } else {
                        if (subMenu.noSubMenu === 0) {
                          storeInLocalStorage("activeMenuId", subMenu.menu_Id); // Store active menu ID
                          storeInCookies("menuPath", subMenu.jspFile);
                          storeInLocalStorage("pageName", subMenu.menuPrompt);

                          // setSearchTerm("");

                          prevMenuPath.current = subMenu.jspFile;

                          navigate(config.baseUrl);
                        }
                      }
                    } else {
                      // e.preventDefault();
                    }
                  }}
                  className={`submenu-title ${isPage ? "bold" : ""}`}
                  tabIndex="0"
                >
                  <i className={`icon-class ${icon.clipboard} menu-icon`} />

                  {isPage ? (
                    // Wrap NavLink inside the div to handle the click

                    <span className="menu-text">{subMenu.menuPrompt}</span>
                  ) : (
                    <span className="menu-text">{subMenu.menuPrompt}</span>
                  )}
                  {
                    <FontAwesomeIcon
                      icon={faAngleDown}
                      className="dropdown-icon"
                    />
                  }
                </div>

                {renderSubMenuSearch(subMenu, data)}
              </li>
            );
          })}
      </ul>
    );
  };

  const renderParentMenuSearch = (data) => {
    return data
      .filter((menuItem) => menuItem.parent_id === 0 && menuItem.menu_Id > 0)
      .map((menuItem) => {
        const hasSubMenu = treeData.some(
          (subMenu) => subMenu.parent_id === menuItem.menu_Id
        );
        return (
          <li key={menuItem.menu_Id} className={`menu-item active }`}>
            <div
              onClick={() => handleMenuClick(menuItem.menu_Id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleMenuClick(menuItem.menu_Id); // Toggle submenu
                }
              }}
              className="menu-title"
              tabIndex="0" // Add tabindex for accessibility
            >
              <i className={`icon-class ${icon.bell} menu-icon`} />
              <span className="menu-text">{menuItem.menuPrompt}</span>
              {
                <FontAwesomeIcon
                  icon={
                    activeMenu === menuItem.menu_Id ? faAngleUp : faAngleDown
                  }
                  className="dropdown-icon"
                />
              }
            </div>
            {renderSubMenuSearch(menuItem, data)}
          </li>
        );
      });
  };

  useEffect(() => {
    // Hide sidebar initially on mobile view
    if (window.innerWidth < 768) {
      setIsSidebarVisible(false);
    }
  }, []);

  const searchPage = () => {
    // Filter for pages based on search term
    const dataWithPage = treeData.filter(
      (menuItem) =>
        menuItem.noSubMenu === 0 &&
        menuItem.menu_Id > 0 &&
        menuItem.menuPrompt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Create a set of parent IDs for the found pages
    const parentIds = new Set(dataWithPage.map((item) => item.parent_id));

    // Filter for submenus that belong to the found pages
    const dataWithSubmenu = treeData.filter(
      (menuItem) =>
        parentIds.has(menuItem.menu_Id) &&
        menuItem.menu_Id > 0 &&
        menuItem.noSubMenu > 0 &&
        menuItem.parent_id !== 0
    );

    // Create a set of parent IDs for the found submenus
    const submenuParentIds = new Set(
      dataWithSubmenu.map((item) => item.parent_id)
    );

    // Filter for parent menus that belong to the found submenus
    const dataWithMenu = treeData.filter(
      (menuItem) =>
        submenuParentIds.has(menuItem.menu_Id) &&
        menuItem.menu_Id > 0 &&
        menuItem.noSubMenu > 0 &&
        menuItem.parent_id === 0
    );

    // Combine all results
    return [...dataWithPage, ...dataWithSubmenu, ...dataWithMenu];
  };

  return (
    <>
      <form className="mb-0 p-1 search-form">
        <div className="search-input-wrapper">
          <input
            id="searchInput"
            aria-label="Search"
            data-bs-toggle="tooltip"
            data-bs-placement="auto"
            title="Search Page Here {Ctrl + K / Ctrl + Shift + K}"
            type="text"
            placeholder="Search Page Here..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input mb-0"
            tabIndex="0"
            autoFocus={true}
            autoComplete="off"
          />
        </div>
      </form>

      <ul className="menu">
        {error ? (
          <div className="text-danger">{error}</div>
        ) : (
          <>
            {searchTerm ? (
              // If there's a search term, check if there are no results
              renderParentMenuSearch(searchPage()).length === 0 ? (
                <div>
                  No results found for{" "}
                  <span
                    className="badge rounded-pill text-bg-light"
                    onClick={clearSearch}
                    onKeyDown={handleKeyDown}
                    tabIndex="0"
                    id="clearSearch"
                  >
                    {searchTerm}
                    <FontAwesomeIcon icon={faTimes} className="clear-icon" />
                  </span>
                </div>
              ) : (
                renderParentMenuSearch(searchPage()) // Show search results if available
              )
            ) : (
              renderParentMenu(treeData) // Show all data if no search term is provided
            )}
          </>
        )}
      </ul>
    </>
  );
};

export default TreeMenu;
