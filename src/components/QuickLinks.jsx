import React, { useEffect, useState } from "react";
import "../styles/QuickLinks.css"; // Import the CSS file
import { NavLink } from "react-router-dom";
import { getList } from "../utils/api";
import Cookies from "js-cookie";
import useCheckResponseStatus from "../hooks/useCheckResponseStatus";
import {
  retrieveFromLocalStorage,
  retrieveFromCookies,
  storeInLocalStorage,
  storeInCookies,
} from "../utils/CryptoUtils";
import config from "../properties/config";

const QuickLinks = () => {
  
  const [menuData, setMenuData] = useState([]); // State to hold the menu data
  const secretKey = retrieveFromCookies("AESDecKey"); // Define or import your secret key
  const { checkResponseStatus } = useCheckResponseStatus();

  const getData = async () => {
    try {

      console.log( retrieveFromCookies("uData" ,"-----uData+++++++++++"));

      const userDetId1 = retrieveFromCookies("userDetId");

      // Encrypt the userDetId for security
      const ciphertext = encAESData(secretKey, { userDetId: userDetId1 });

      // Send request to get the list
      const response = await getList("dashboard", "quickLinks", ciphertext);
      const responseData = checkResponseStatus(response);

      if (responseData) {
        const jsonData = JSON.parse(responseData.rData);
        const decryptedData = decAESData(secretKey, jsonData);

        console.log(decryptedData, "---------------quicklinks");

        // Update state with decrypted data
        setMenuData(JSON.parse(decryptedData.recData)); // Assuming this contains the list of menu names and IDs
      } else {
        console.error("encryptData is undefined in the backend response.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleMenuClick = (menuId, jspFile) => {
    // Remove the old menuId from cookies
    Cookies.remove("menuPath");

    storeInCookies("menuPath", jspFile);
    localStorage.removeItem("activeMenuId");
    // Set the new menuId in the cookies
    // Cookies.set("menuId", menuId, { expires: 7 }); // The cookie expires in 7 days (you can adjust the expiry)
    storeInLocalStorage("activeMenuId", menuId, { expires: 1 });
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <nav className="QuickLink-container" aria-label="breadcrumb">
        <ul className="QuickLink">
          <li>
            <span className="QuickLink-icon">🛑</span> Favorites Link
          </li>

          {menuData.length > 0 ? (
            menuData.map((menu, index) => (
              <>
                <span>|</span>
                <li>
                  <NavLink
                    to={config.baseUrl}
                    key={index}
                    onClick={() => handleMenuClick(menu.menuId, menu.jspFile)}
                    tabIndex="1"
                  >
                    {/* <span className="breadcrumb-icon"> 📃 </span>  */}
                    {menu.menuPrompt}
                  </NavLink>
                </li>
              </>
            ))
          ) : (
            <li>No quick links available</li>
          )}
        </ul>
      </nav>
    </>
  );
  // return (
  //   <>
  //     <nav className="QuickLink-container" aria-label="breadcrumb">
  //       <ul className="QuickLink">
  //         <li>
  //           <span className="QuickLink-icon">🛑</span> Favorites Link
  //         </li>

         
  //           <li>No quick links available</li>
    
  //       </ul>
  //     </nav>
  //   </>
  // );
};

export default QuickLinks;
