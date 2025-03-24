import React, { useEffect } from 'react'
import { useState } from 'react';
import FormButton from '../components/FormButton';
import { getDelete, getDropDown, getList, getSave } from '../utils/api';
import SelectComponent from '../components/SelectComponent';
import icon from '../properties/icon';
import useCheckResponseStatus from '../hooks/useCheckResponseStatus';
import ErrorMessageABD from "../components/ErrorMessageABD";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import AgGridTable from '../components/AgGridTable';
import { retrieveFromLocalStorage, retrieveFromCookies, storeInLocalStorage, storeInCookies } from "../utils/CryptoUtils";
import config from '../properties/config';

import { NavLink } from "react-router-dom";



const Quicklinkspage = () => {
  
  const [deleteCooldown, setDeleteCooldown] = useState(false);
  const [showSave, setShowSave] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorVisibleComponent, setErrorMessageVisibleComponent] =
    useState(false);
  const [errorType, setErrorType] = useState();
  const [errorDivMessage, setErrorDivMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState([]);

  const secretKey = retrieveFromCookies("AESDecKey");
  const { checkResponseStatus } = useCheckResponseStatus();
  const [rcds, setRcds] = useState({
    page: "",
    module: "",
    userDetId: "",
    userId: "", // Initial value will be updated in useEffect
    publicIp: "",
  });

  const [s_userId, setS_UserId] = useState({
    userId: "",
    publicIp: "",
    userDetId: "",
  });

  useEffect(() => {
    const publicIp = retrieveFromCookies("publicIp") || "";
    const uDataCookie = retrieveFromCookies("uData");
    const userDetId = (retrieveFromCookies("userDetId"));
    const uData = uDataCookie ? JSON.parse(uDataCookie) : {};
    const userId = uData.userName || "NoUser";

    setS_UserId(() => ({
      userId: userId,
      publicIp: publicIp,
      userDetId: userDetId,
    }));
  }, []);

  const [moduleRcds, setModuleRcds] = useState([
    { value: "", label: "" },
  ])

  const [resetSelect, setResetSelect] = useState(false); // State for manipulating dropdown and search


  const moduleQuery = {
    table: "tree_menu",
    fields: "menu_id,  menu_prompt",
    condition: "menu_id IN (SELECT parent_id FROM tree_menu WHERE menu_id IN (SELECT parent_id FROM" +
      " tree_menu WHERE menu_id IN" +
      ` (SELECT page_id FROM web_user_acess WHERE user_id='${(retrieveFromCookies("userDetId"))}')))`,
    orderBy: "",
  }
  const getModuleDropDownData = async () => {
    getDropDown(moduleQuery, moduleRcds, setModuleRcds, "common", secretKey);
  };

  useEffect(() => {
    getModuleDropDownData();
  }, []);

  const [pageRcds, setPageRcds] = useState([
    { value: "", label: "" },
  ])

  const pageQuery = {
    table: "tree_menu",
    fields: "menu_id,  menu_prompt",
    condition: `menu_id IN ` +
      `(SELECT page_id FROM web_user_acess WHERE user_id='${(retrieveFromCookies("userDetId"))}')` +
      ` and MENU_ID like '${rcds.module}0%' and NO_SUB_MENU=0`,
    orderBy: "",
  }


  const getPageDropDownData = async () => {
    getDropDown(pageQuery, pageRcds, setPageRcds, "common", secretKey);
  };
  useEffect(() => {
    getPageDropDownData();
  }, [rcds.module]);


  const [errorMessages, setErrorMessages] = useState({
    module: "",
    page: "",

  });

  const data = {
    module: "Select Module",
    mHolder: "Select Module",
    page: "Page",
    pHolder: "Enter Page ",
    save: "Save",
    delete: "Delete",
    update: "Update",
    back: "Back",
    reset: "Reset",
  };

  const handleBack = {};
  const handleReset = () => {
    // Reset rcds to its initial state

    setRcds({
      page: "",
      module: "",
      userDetId: s_userId.userDetId,
    });

    setResetSelect(true); // for dropdown search

    setErrorMessages("");
  };
  const validateFields = () => {
    const errors = {};
    if (!rcds.module) errors.module = "Module is required";
    if (!rcds.page) errors.page = "page is required";
    return errors;
  };

  const handleCreate = async (evt) => {
    let response;
    evt.preventDefault(); // Prevent default form submission
    setLoading(true); // Start loading state
    setShowSave(false);
    const errors = validateFields();
    if (Object.keys(errors).length > 0) {
      setErrorMessages(errors);
      setLoading(false);
      setShowSave(true);
      return;
    }
    
    const updatedRcds = {
      ...rcds,
      userId: s_userId.userId, // Ensure userId is included
      publicIp: s_userId.publicIp, // Ensure publicIp is included
      userDetId: s_userId.userDetId,
    };

    try {
      // Encrypt the updated rcds with the userId
      const ciphertext = encAESData(secretKey, updatedRcds);
      let responseData;
      // Send data to the backend
      response = await getSave("dashboard", "quickLinks", ciphertext);
      responseData = checkResponseStatus(response);

      if (responseData) {
        // Check if the operation was successful
        if (responseData.rType === "Y") {
          const jsonData = JSON.parse(responseData.rData);
          const decryptedData = decAESData(secretKey, jsonData);
          setErrorMessageVisibleComponent(true);
          setErrorType(true);
          setErrorDivMessage(responseData.rMessage);

          // Automatically hide the message after it has been shown
          setTimeout(() => {
            setErrorMessageVisibleComponent(false);
            setErrorDivMessage("");
            setShowSave(true);
          }, 4000); // Adjust time as needed

          // Clear the form fields by resetting rcds to its initial state
          setRcds({
            // Replace with your initial state for rcds
            page: "",
            module: "",
            userDetId: "",
            userId: rcds.userId,
            publicIp: rcds.publicIp,
          });

          // setResetSelect(true);
        } else {
          setErrorMessageVisibleComponent(true);
          setErrorType(false);
          setErrorDivMessage(responseData.rMessage);
          setShowSave(true);
        }

        // Refresh the data list after saving
        getData();
      }
    } catch (error) {
      console.error("Error during create/update:", error);
      setErrorMessageVisibleComponent(true);
      setErrorType(false);
      setErrorDivMessage(response.data.rMessage);
    } finally {
      setLoading(false); // End loading state
    }
  };

  const getData = async () => {
    try {
      const userDetId1 = (retrieveFromCookies("userDetId"));

      // Encrypt the searchRcds data.....
      const ciphertext = encAESData(secretKey, { userDetId: userDetId1, });

      // Send request to get the list
      const response = await getList("dashboard", "quickLinks", ciphertext);

      const responseData = checkResponseStatus(response);
      if (responseData.rData) {
        const jsonData = JSON.parse(responseData.rData);
        const decryptedData = decAESData(secretKey, jsonData);

        // Update state with decrypted data
        setApiData(JSON.parse(decryptedData.recData));
      } else {
        console.error("encryptData is undefined in the backend response.");
      }


    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getData();
  }, []);


  const handleDelete = async ({ menuId }) => {
    const userDetId1 = (retrieveFromCookies("userDetId"));
    setDeleteCooldown(true);
    setIsDeleting(true);
    let response;
    setLoading(true); // Start loading state
    setShowSave(false);
    try {
      // Encrypt the roleId to send to the backend
      const ciphertext = encAESData(secretKey, { userDetId: userDetId1, page: menuId });

      // Send the delete request to the backend
      response = await getDelete("dashboard", "quickLinks", ciphertext);

      const responseData = checkResponseStatus(response);

      if (responseData.rData) {
        const jsonData = JSON.parse(responseData.rData);
        const decryptedData = decAESData(secretKey, jsonData);

      } else {
        console.error("encryptData is undefined in the backend response.");
      }

      // Refresh the data after deletion
      getData(); // Refresh the table data
      if (responseData.rType === "Y") {
        // Update state or show success message

        setErrorMessageVisibleComponent(true);
        setErrorType(true);
        setErrorDivMessage(response.data.rMessage);
      } else {
        setErrorMessageVisibleComponent(true);
        setErrorType(false);
        setErrorDivMessage(response.data.rMessage);
      }
    } catch (error) {
      console.error("Error deleting data:", error);
      setErrorMessageVisibleComponent(true);
      setErrorType(false);
      setErrorDivMessage(response.data.rMessage);
    } finally {
      setLoading(false); // End loading state
      setIsDeleting(false); // restart delete button

      // Set the cooldown
      setTimeout(() => {
        setDeleteCooldown(false); // Reset the cooldown after 3 seconds
        setShowSave(true);
      }, 4000);
    }

  };

  const columnDefs = [
    {
      headerName: 'Serial No.',
      field: 'serialNo',
      sortable: true,
      filter: 'agNumberColumnFilter',
      flex: 1,
      headerClass: 'ag-header-cell',  // Optional: add custom header class
    },
    {
      headerName: 'Module',
      field: 'module',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      flex: 1,
    },


    {
      headerName: 'Page',
      field: 'page',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      flex: 1,
    },


    {
      headerName: 'Delete',
      field: 'button',
      cellRenderer: (params) => {
        // const deleteCooldown = false;  // Replace with actual state/logic
        // const isEditing = false; // Replace with actual state for editing

        return (
          <span
            className={`manipulation-icon delete-color ${deleteCooldown ? 'disabled' : ''}`}
            onClick={() => {
              const confirmDelete = window.confirm("Are you sure you want to delete this record?");
              if(confirmDelete){
                if (!deleteCooldown) {
                  const id = { menuId: params.data.menuId };  // Access row data to get the roleId
                  handleDelete(id);  // Call the handleDelete function with the roleId
                }
              }
            }}
            style={{
              pointerEvents: deleteCooldown ? 'none' : 'auto',
              opacity: deleteCooldown ? 0.5 : 1,  // Reduce opacity to indicate disabled state
            }}
          >
            <FontAwesomeIcon icon={faTrash} />
            <span className="manipulation-text">Delete</span>
          </span>
        );
      },
      sortable: false,
      filter: false,  // No filtering for actions columns
      flex: 1,
      cellClass: 'ag-center-cols-cell',  // Optional: center the delete icon
    }
  ];


  const tableData = apiData.map((item, sno) => ({
    serialNo: sno + 1,
    module: item.module,
    page: item.menuPrompt,
    menuId: item.menuId,
  }));


  return (


    <div className="rightArea">
              <div className="row">
      <div className="col-12">
            <ol className="breadcrumb modern-breadcrumb mx-3">

              <li className="breadcrumb-item pe-auto"  >
                <NavLink
                  onClick={(e) => {
                    e.preventDefault(); // Prevent the default navigation behavior

                    storeInLocalStorage("activeMenuId", "dashboard");
                  }}
                  className="nav-link sub-link"
                  to={config.baseUrl}
                >
                  <i className={icon.house}></i>
                  <span className='ms-2'>Dashboard</span>
                </NavLink>
              </li>

              <li className="breadcrumb-item">
                <span className="breadcrumb-text">User Details</span>
              </li>
              <li className="breadcrumb-item">
                <span className="breadcrumb-text">Add to Favorite's</span>
              </li>
            </ol>
          </div>
          </div>
      <div className="container-body">
        <div className="row mb-3">
          <div className="col-6">
            <h4 className="card-title mb-3"> Add to Favorite's</h4>
          </div>
          <div className="col-6 d-flex justify-content-end"></div>
          <form action="" className="mb-5">
            <div className="card">
              <div className="card-body">
                <div className="row mb-3">

                  <div className="col-md-6">
                    <SelectComponent
                      label="Module"
                      name="Module"
                      id="Module"
                      selectedValue={rcds.module}
                      resetValue={resetSelect}
                      onSelects={(value) =>
                        setRcds((prevState) => ({
                          ...prevState,
                          module: value,
                        }))
                      }
                      errorMessage={errorMessages.module}
                      icon={icon.arrowDown} // Example icon class for FontAwesome
                      bdr="2px solid #007bff"
                      padds="0"
                      options={moduleRcds} // Pass roleLevelOptions here
                    />
                  </div>

                  <div className="col-md-6">
                    <SelectComponent
                      label="Pages"
                      name="Page"
                      id="Page"
                      selectedValue={rcds.page}
                      // resetValue={resetSelect}  fdont use this inbuild reset select
                      onSelects={(value) =>
                        setRcds((prevState) => ({
                          ...prevState,
                          page: value,
                        }))
                      }
                      errorMessage={errorMessages.page}
                      icon={icon.arrowDown} // Example icon class for FontAwesome
                      bdr="2px solid #007bff"
                      padds="0"
                      options={pageRcds} // Pass roleLevelOptions here
                    />
                  </div>
                </div>

                <div className="row my-2">
                  <div className="col-md-12">
                    {
                      showSave && <FormButton
                        btnType1={data.save}
                        btnType3={data.update}
                        btnType4={data.back}
                        btnType5={data.reset}
                        onClick={handleCreate}
                        onBack={handleBack}
                        onReset={handleReset}
                        showUpdate={!!rcds.id}
                        rcds={rcds}
                        loading={loading}
                      />
                    }
                  </div>
                </div>

                <div className="d-flex justify-content-center align-items-center my-2">
                  <ErrorMessageABD
                    text={errorDivMessage}
                    isSuccess={errorType}
                    isVisible={errorVisibleComponent}
                    setVisible={setErrorMessageVisibleComponent} // Pass the function to reset visibility
                  />
                </div>
              </div>
              {/* <CreateUpdateBar
                preparedData={rcds.createdBy}
                modifiedData={rcds.modifiedBy}
              /> */}
            </div>
          </form>

          <div style={{ width: '100%', height: '100vh' }} className="ag-theme-alpine my-2">
            <AgGridTable
              rowData={tableData}
              columnDefs={columnDefs}
              domLayout="autoHeight"
              pagination={true}  // Optional: Enable pagination if needed
              enableSorting={true}  // Optional: Enable sorting
              enableFilter={true}  // Optional: Enable global filtering
              suppressCellSelection={true}  // Prevent selecting cells (optional)
            />
          </div>
        </div>
      </div>
    </div>





  )
}

export default Quicklinkspage;