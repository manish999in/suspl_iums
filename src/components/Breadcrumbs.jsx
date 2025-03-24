import { NavLink, useNavigate } from "react-router-dom";
import React, { useContext, useEffect, useRef, useState } from "react"; // Correct import
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { getViewRecord } from "../utils/api";
import useCheckResponseStatus from "../hooks/useCheckResponseStatus";
import "../styles/BreadCrumb.css";
import config from "../properties/config";
import {
  retrieveFromLocalStorage,
  retrieveFromCookies,
  storeInLocalStorage,
} from "../utils/CryptoUtils";
import Cookies from "js-cookie";
import useKeyboardShortcut from "../hooks/useKeyboardShortcut";
import { GlobalContext } from "../context/GlobalContextProvider";

// import useKeyboardShortcut from "../hooks/useKeyboardShortcut";

const Breadcrumbs = () => {
  const { secretKey, customModalIsOpen2, setCustomModelIsOpen2 } =
    useContext(GlobalContext);


      useKeyboardShortcut(
        "v",
        () => {
          showHidePageDetails();
        },
        { alt: true }
      );

      const showHidePageDetails =() => {
        if (customModalIsOpen2) {
          setCustomModelIsOpen2(false);
        } else {
          setCustomModelIsOpen2(true);
        }
      }

  const dashboardLinkRef = useRef(null); // Create a reference for the Dashboard link

  const [module, setModule] = useState("");
  const [subModule, setSubModule] = useState("");
  const [page, setPage] = useState("");
  const { checkResponseStatus } = useCheckResponseStatus();

  let id = retrieveFromLocalStorage("activeMenuId");

  const fetchData = async () => {
    try {
      const ciphertext = encAESData(secretKey, { id });
      const response = await getViewRecord("common", "breadCrum", ciphertext);
      const responseData = checkResponseStatus(response);
      if (responseData.rData) {
        const recJson = JSON.parse(responseData.rData);
        const decryptedData = decAESData(secretKey, recJson);

        setModule(decryptedData.recData[0].menuprompt);
        setSubModule(decryptedData.recData[1].menuprompt);
        setPage(decryptedData.recData[2].menuprompt);
      }
    } catch (error) {
      console.error("Error fetching record name:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <ol className="breadcrumb modern-breadcrumb">
            <li
              className="breadcrumb-item pe-auto"
              aria-label="Dashboard"
              data-bs-toggle="tooltip"
              data-bs-placement="auto"
              title="Go to Dashboard"
            >
              <NavLink
                ref={dashboardLinkRef} // Attach the reference to the NavLink
                onClick={(e) => {
                  localStorage.removeItem("menuPath");
                  Cookies.remove("menuPath");

                  storeInLocalStorage("activeMenuId", "dashboard");
                }}
                to={config.baseUrl}
                tabIndex="-1"
              >
                <FontAwesomeIcon
                  icon={faHome}
                  className="breadcrumb-icon pe-auto"
                  // Make it focusable
                />
                <span>Dashboard</span>
              </NavLink>
            </li>

            <li className="breadcrumb-item">
              <span className="breadcrumb-text">{module}</span>
            </li>
            <li className="breadcrumb-item">
              <span className="breadcrumb-text">{subModule}</span>
            </li>
            <li
              className="breadcrumb-item active"
              aria-label="Logout"
              data-bs-toggle="tooltip"
              data-bs-placement="auto"
              title="Current Page"
            >
              <span className="breadcrumb-text">{page}</span>
            </li>
            <li
              className="text-end  custom-breadcrumb-right"
              aria-label=""
              data-bs-toggle="tooltip"
              data-bs-placement="auto"
              title="Get Details (alt+v)"
              onClick={showHidePageDetails}
            >
              <span className="breadcrumb-text">Get Details</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Breadcrumbs;
