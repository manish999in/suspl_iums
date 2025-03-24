import React, { useEffect, useRef, useState } from "react";
import {
  retrieveFromCookies,
  retrieveFromLocalStorage,
} from "../utils/CryptoUtils";

// Create the context
export const GlobalContext = React.createContext();

// Create a provider component
export const GlobalContextProvider = ({ children }) => {
  const secretKey = retrieveFromCookies("AESDecKey");
  const [s_user, setS_UserId] = useState({
    userId: "",
    publicIp: "",
    userName: "",
    userStatus: "",
    uData: {},
  });
  const [customModalIsOpen2, setCustomModelIsOpen2] = React.useState(false);
  const [columnDefsApi, setColumnDefsApi] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [refreshAGGrid, setrefreshAGGrid] = useState(false);
  const [tableHeader, setTableHeader] = useState([]);
  const [menuPath, setMenuPath] = useState("");
  const [reloadTableFlag, setReloadTableFlag] = useState(false);
  const prevMenuPath = useRef(null);
  const [highlightRow, setHighlightRow] = useState(false);


  useEffect(() => {
    // Function to check cookie and update state
    const checkCookie = () => {
      const publicIp = retrieveFromCookies("publicIp") || "";
      const uDataCookie = retrieveFromCookies("uData");
      const uData = uDataCookie ? JSON.parse(uDataCookie) : {};
      const userId = uData.userId || "NoUser";
      const userStatus = uData.userStatus || "";
      const userName = uData.userName || "";

      setS_UserId(() => ({
        userId: userId,
        publicIp: publicIp,
        userName: userName,
        userStatus: userStatus,
        uData: uData,
      }));
    };

    checkCookie();
  }, []);

  useEffect(() => {
    function checkMenuPath() {
      const menuPathRetrived = retrieveFromLocalStorage("menuPath");
      if (prevMenuPath.current != menuPathRetrived) {
        setColumnDefsApi([]);
        setTableData([]);
        setRowData([]);
        setTableHeader([]);
        prevMenuPath.current = menuPathRetrived;
        setMenuPath(menuPathRetrived);
        setrefreshAGGrid(false);
        setReloadTableFlag(false);
        setHighlightRow(false);
      }
      // console.log("speed")
    }

    checkMenuPath();

    const intervalId = setInterval(checkMenuPath, 1); // this check will not create an issue because it only function when 
    // the menuPath is changed {only create when munpath is changing more then the speed of the check which is not possible }

    return () => clearInterval(intervalId);
  }, []);



    // changes

 

  return (
    <GlobalContext.Provider
      value={{
        s_user,
        columnDefsApi,
        setColumnDefsApi,
        rowData,
        setRowData,
        tableData,
        setTableData,
        refreshAGGrid,
        setrefreshAGGrid,
        tableHeader,
        setTableHeader,
        reloadTableFlag, 
        setReloadTableFlag,
        highlightRow, 
        setHighlightRow,
        secretKey,
        customModalIsOpen2, setCustomModelIsOpen2
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
