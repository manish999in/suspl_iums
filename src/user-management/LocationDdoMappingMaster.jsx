import React, { useState, useEffect, useRef, useContext } from "react";
import "../styles/inputStyle.css";
import FormButton from "../components/FormButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import "../styles/AdvancedSearch.css";
import useCheckResponseStatus from "../hooks/useCheckResponseStatus";
import ErrorMessageABD from "../components/ErrorMessageABD";
import AdvanceSearchModal from "../components/AdvanceSearchModal";
import SelectComponent from "../components/SelectComponent";
import FormMultiSelect from "../components/FormMultiSelect";

import {
  retrieveFromCookies,
  retrieveFromLocalStorage,
} from "../utils/CryptoUtils";

import {
  getDelete,
  getList,
  getSave,
  getUpdate,
  getViewRecord,
  getDropDown,
} from "../utils/api";
import AgGridTable from "../components/AgGridTable";
import Breadcrumbs from "../components/Breadcrumbs";
import icon from "../properties/icon";
import useKeyboardShortcut from "../hooks/useKeyboardShortcut";
import CustomModal from "../components/CustomModal";
import FilterTags from "../components/FilterTags";
import { GlobalContext } from "../context/GlobalContextProvider";

const LocationDdoMappingMaster = () => {
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const {
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
  } = useContext(GlobalContext);

  const deleteCooldown = useRef(false);
  const [resetSelect, setResetSelect] = useState(false); // State for manipulating dropdown and search

  const [errorVisibleComponent, setErrorMessageVisibleComponent] =
    useState(false);
  const [errorType, setErrorType] = useState();
  const [errorDivMessage, setErrorDivMessage] = useState("");
  const [errorMessages, setErrorMessages] = useState({
    locationddo: "",
    ddoName: "",
    address1: "",
    address2: "",
    isMetro: "",
  }); // handling error

  // changes
  const [rcds, setRcds] = useState({
    Id: "",
    locationddo: "",
    ddoName: [],
    locationddoId:"",

    // college: "",
    userId: "", // Initial value will be updated in useEffect
    publicIp: "", // Initial value will be updated in useEffect
  });

  const secretKey = retrieveFromCookies("AESDecKey");

  const saveButtonRef = useRef(null); // Reference for the Save button

  const [searchRcds, setSearchRcds] = useState({
    locationddo: "",
    ddoName: "",
  });
  const [showSave, setShowSave] = useState(true);

  const [loading, setLoading] = useState(false); // Loading state
  const { checkResponseStatus } = useCheckResponseStatus();

  const data = {
    uName: "Location",
    uHolder: "Select Location",
    cCity: "DDO",
    cholder: "Select Ddo",
    locationddo: "locationddo",
    ddoName: "ddoName",

    // college: "college",
    save: "Save",
    delete: "Delete",
    update: "Update",
    back: "Back",
    reset: "Reset",
  };
  const handleBack = () => {
    deleteCooldown.current = false;
    if (saveButtonRef.current) {
      saveButtonRef.current.scrollIntoView({ behavior: "smooth" });
    }

    // Alternatively, clear form data and reset state if needed
    setRcds({
      userTypeId: "",
      locationddo: "",
      ddoName: [],
      college: "",
      userId: "",
    });
  };

  const handleReset = () => {
    // Reset rcds to its initial state
    setRcds({
      Id: null,
      locationddo: "",
      ddoName: "",
      college: "",
    });
    setResetSelect(true); // for dropdown search

    setErrorMessages("");
  };

  const handleChange = (evt) => {
    const { name, value, type, checked } = evt.target;

    setRcds((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? (checked ? "Y" : "N") : value,
    }));

    // Remove the error for the current field while typing
    setErrorMessages((prevErrors) => ({
      ...prevErrors,
      [name]: "", // Clear error message for the current field
    }));
  };

  const handleSearchChange = (evt) => {
    const { name, value, type, checked } = evt.target;
    setSearchRcds((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const validateFields = () => {
    const errors = {};
    if (!rcds.locationddo) errors.locationddo = "Please Select Location!";
    if (rcds.ddoName.length < 1) {
      errors.ddoName = "Atleast one DDO should be selected!";
    }
    return errors;
  };

  const handleCreate = async (evt) => {
    evt.preventDefault(); // Prevent default form submission
    setLoading(true); // Start loading state
    const errors = validateFields();
    if (Object.keys(errors).length > 0) {
      setErrorMessages(errors);
      setLoading(false);
      return;
    }
    setShowSave(false);

    const updatedRcds = {
      ...rcds,
      userId: s_user.userId, // Ensure userId is included
      publicIp: s_user.publicIp, // Ensure publicIp is included
    };

    try {
      // Encrypt the updated rcds with the userId
      const ciphertext = encAESData(secretKey, updatedRcds);
      console.log("Encrypted Data: ", ciphertext);
      let responseData;
      if (rcds.locationddoId) {
        // Update the existing record
        deleteCooldown.current = false;
        const response = await getUpdate(
          "user",
          "ddoLocationMapping",
          ciphertext
        );
        console.log("Update response from backend:", response.data);

        responseData = checkResponseStatus(response);
      } else {
        // Send data to the backend

        const response = await getSave(
          "user",
          "ddoLocationMapping",
          ciphertext
        );
        console.log("Response from backend:", response.data);
        responseData = checkResponseStatus(response);
        console.log(responseData);
      }

      if (responseData) {
        // Check if the operation was successful
        if (responseData.rType === "Y") {
          const jsonData = JSON.parse(responseData.rData);
          const decryptedData = decAESData(secretKey, jsonData);
          console.log("Decrypted Data:", decryptedData);

          // Clear the form fields by resetting rcds to its initial state
          setRcds({
            // Replace with your initial state for rcds
            Id: null,
            locationddo: "",
            ddoName: "",
            college: "",
            userId: rcds.userId,
            publicIp: rcds.publicIp,
            //college: "",
          });
          setResetSelect(true); // for dropdown search

          setErrorMessageVisibleComponent(true);
          setErrorType(true);
          setErrorDivMessage(responseData.rMessage);
          setShowSave(true);
        } else {
          setErrorMessageVisibleComponent(true);
          setErrorType(false);
          setErrorDivMessage(responseData.rMessage);
          responseData;
        }

        // Refresh the data list after saving
        getData();
      }
    } catch (error) {
      console.error("Error during create/update:", error);
    } finally {
      setLoading(false); // End loading state

      deleteCooldown.current = false;
      setShowSave(true);
      // Automatically hide the message after it has been shown
      setTimeout(() => {
        setErrorMessageVisibleComponent(false);
        setErrorDivMessage("");
      }, 4000);

      setHighlightRow(false); // changes
    }
  };

  useEffect(() => {
    if (resetSelect) {
      // Reset the select component after render
      setResetSelect(false);
    }
  }, [resetSelect]);

  const getData = async () => {
    try {
      const menuId = retrieveFromLocalStorage("activeMenuId");
      // Encrypt the searchRcds data
      const ciphertext = encAESData(secretKey, { menuId });

      // Send request to get the list
      const response = await getList(
        "user",
        "ddoLocationMapping",
        ciphertext
      );

      const responseData = checkResponseStatus(response);

      console.log(responseData, "-------");

      if (responseData.rType === "Y") {
        if (responseData.rData) {
          const jsonData = JSON.parse(responseData.rData);

          const decryptedData = decAESData(secretKey, jsonData);

          console.log(decryptedData);

          const header = JSON.parse(decryptedData.recData.header);

          let parsedLocations = [];
          let updatedData = [];
          if (decryptedData.recData.data) {
            const dataRec = JSON.parse(decryptedData.recData.data);

            console.log(dataRec, "------dataRec");

          
            const mergedArray = dataRec
            .map(item => JSON.parse(item)) // Parse each string into an array
            .reduce((acc, currentArray) => acc.concat(currentArray), []); 


            console.log(mergedArray ,"------------mergedArray");

            // Add serialNo to the data
            updatedData = mergedArray.map((item, index) => ({
              ...item,
              serialNo: index + 1, // Auto-increment serialNo
            }));
          }

          const updatedHeader = header
            .sort((a, b) => {
              if (a.order_by < b.order_by) return -1;
              if (a.order_by > b.order_by) return 1;
              return 0;
            })
            .map(({ width, ...item }) => ({
              ...item,
              cellStyle: {
                textAlign: item.cellStyle,
                whiteSpace: "normal", // Allow text to wrap
                wordWrap: "break-word",
              },
              autoHeight: true, // Automatically adjust the row height to fit content
            }));

            console.log(updatedData , "updatedDataupdatedData");
            console.log(updatedHeader , "updatedHeaderupdatedHeader");

          setTimeout(() => {
            setTableData(updatedData); // for changing table data
            setColumnDefsApi(updatedHeader);
            setRowData(updatedData); // for globally keeping the Table data
          }, 500);
        }
      } else {
        setColumnDefsApi([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      getData();
    }, 500);
    setTimeout(() => {
      resetTable();
    }, 500);
  }, []);

  const [locationRcds, setLocationRcds] = useState([{ value: "", label: "" }]);
  const [DdoTypeRcds, setDdotypeRcds] = useState([{ value: "", label: "" }]);

  const locationQuery = {
    table: "leave_location_mast",
    fields: "LOCATION_CODE,LOCATION_NAME",
    // condition: `LOCATION_CODE not in (select LOCATION_CODE from ddolocationmapping m, cparam c where c.CODE='USER' 
    // and c.SERIAL='DEFAULT' AND c.PARAM1='Y' )`,
    condition : "1=1",
    orderBy: "order by LOCATION_CODE",
  };

  const getDropDownData = async () => {
    try {
      getDropDown(
        locationQuery,
        locationRcds,
        setLocationRcds,
        "common",
        secretKey
      );
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  const DdoQuery = {
    table: "ddo",
    fields: "DDO_ID,DDONAME",
    condition: "ddo_id not in (select ddo_id from ddolocationmapping)",
    orderBy: "order by ddoname",
  };
  ///

  const getDdoDropDownData = async () => {
    getDropDown(DdoQuery, DdoTypeRcds, setDdotypeRcds, "common", secretKey);
  };

  const [mappedDDoRcds, setMappedDDoRcds] = useState([
    { value: "", label: "" },
  ]);

  const mappedDdoQuery = {
    table: "ddolocationmapping dlm left join ddo d on d.DDO_ID=dlm.DDO_ID",
    fields: "dlm.DDO_ID,d.DDONAME",
    condition: `dlm.LOCATION_CODE="${rcds.locationddo}"`,
    orderBy: "",
  };

  const getMappedDdoDropDownData = async () => {
    getDropDown(
      mappedDdoQuery,
      mappedDDoRcds,
      setMappedDDoRcds,
      "common",
      secretKey
    );
  };
  useEffect(() => {
    getDropDownData();
    getDdoDropDownData();
    getData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    getDdoDropDownData();
    getMappedDdoDropDownData();
  }, [rcds.locationddo]);

  useEffect(() => {
    console.log(mappedDDoRcds,"-----------mappedDDoRcds");
    if (
      mappedDDoRcds.length >0 &&
      mappedDDoRcds[0].value !== "" &&
      mappedDDoRcds[0].label !== "" &&
      DdoTypeRcds.length > 0
    ) {
      const allDdoData = [...mappedDDoRcds, ...DdoTypeRcds];
      setDdotypeRcds(allDdoData);

      for (let item of mappedDDoRcds) {
        setRcds((prevState) => ({
          ...prevState,
          ddoName: [...prevState.ddoName, item.value],
        }));
      }
    }
  }, [mappedDDoRcds]);

  const viewRecord = async (locationCode) => {
    deleteCooldown.current = true;
    try {
      setErrorMessages("");
      const ciphertext = encAESData(secretKey, { locationCode });

      const response = await getViewRecord(
        "user",
        "ddoLocationMapping",
        ciphertext
      );

      const responseData = checkResponseStatus(response);

      if (responseData.rData) {
        const recJson = JSON.parse(responseData.rData);
        const decryptedData = decAESData(secretKey, recJson);

        const dataToSet = JSON.parse(decryptedData.recData); // Assuming you want the first item

        // const dataToSet = dataToRec[0];

        console.log(dataToSet);
        
        let dataArray= [];
        dataToSet.forEach((data) => {

            dataArray.push(data.ddoName);
        });
        // console.log(dataArray);

        // Update rcds state with the decrypted data
        setRcds({
          Id: dataToSet[0].Id,
          locationddo: dataToSet[0].locationddo,
          ddoName: dataArray,
          userId: s_user.userId, // Use userId from s_userId
          publicIp: s_user.publicIp, // Use publicIp from s_userId
          locationddoId:dataToSet[0].locationddo
        });
      } else {
        console.error("encryptData is undefined in the backend response.");
      }
    } catch (error) {
      console.error("Error retrieving data:", error);
    } finally {
    }
  };

  const handleDelete = async (Id) => {
    console.log("idddd", Id);

    deleteCooldown.current = true;
    setShowSave(false);
    setLoading(true); // Start loading state

    try {
      const ciphertext = encAESData(secretKey, { Id });

      // Send the delete request to the backend
      const response = await getDelete(
        "user",
        "ddoLocationMapping",
        ciphertext
      );

      const responseData = checkResponseStatus(response);

      if (responseData.rData) {
        const jsonData = JSON.parse(responseData.rData);
        const decryptedData = decAESData(secretKey, jsonData);
      } else {
        console.error("encryptData is undefined in the backend response.");
      }

      if (responseData.rType === "Y") {
        setErrorMessageVisibleComponent(true);
        setErrorType(true);
        setErrorDivMessage(responseData.rMessage);
        setShowSave(true);

        setTimeout(() => {
          setErrorMessageVisibleComponent(false);
          setErrorDivMessage("");
        }, 4000); 

        let updatedData = rowData
          .filter((item) => item.locationCode !== Id)
          .map((item, index) => ({
            ...item,
            serialNo: index + 1, // Auto-increment serialNo
          }));

        setRowData(updatedData);
        setTableData(updatedData);
      } else {
        setErrorMessageVisibleComponent(true);
        setErrorType(false);
        setErrorDivMessage(response.data.rMessage);
      }
    } catch (error) {
      console.error("Error deleting data:", error);
    } finally {
      setLoading(false); // End loading state
      setShowSave(true);
      deleteCooldown.current = true;

      setTimeout(() => {
        setErrorMessageVisibleComponent(false);
        setErrorDivMessage("");
      }, 4000);
      setHighlightRow(false); //changes
    }
  };

  const columnDefs = [
    {
      headerName: "Serial No.",
      field: "serialNo",
      sortable: true,
      // filter: "agNumberColumnFilter",
      // flex: 1,
      width: 100,
      // headerClass: "ag-header-cell", // Optional: add custom header class
      cellStyle: { textAlign: "center" },
      // pinned: "left",
      // movable: false,
    },

    ...columnDefsApi,
    {
      headerName: "Action",
      field: "button",
      enableMenu: true,
      cellRenderer: (params) => (
        <>
          <span
            // tabIndex={1}
            className="manipulation-icon edit-color mx-3"
            onClick={() => {
              const id = params.data.locationCode; // Access the row data to get the roleId
              setHighlightRow(true); //changes
              console.log(params,"------params");
              console.log(params.data,"---------params.data");
              console.log(params.data.locationCode,"------------params.data.locationCode");
              viewRecord(id); // Call viewRecord function with the id
              window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to the top
            }}
          >
            <FontAwesomeIcon icon={faEdit} className="icon-size" />
          </span>

          <span
            // tabIndex={1}
            className={`manipulation-icon delete-color ${
              deleteCooldown.current ? "disabled" : ""
            } mx-1`}
            onClick={() => {
              setHighlightRow(true);
              if (!deleteCooldown.current) {
                setHighlightRow(true); //changes
                // Show confirmation alert
                const confirmDelete = window.confirm(
                  "Are you sure you want to delete this record?"
                );
                if (confirmDelete) {
                  const id = params.data.locationCode; // Access row data to get the salId
                  setHighlightRow(true); //changes
                  handleDelete(id); // Call the handleDelete function with the salId
                  setHighlightRow(false); //changes
                } else {
                  setHighlightRow(false); //changes
                }
              }
            }}
            style={{
              pointerEvents: deleteCooldown.current ? "none" : "auto", // Disable click
              opacity: deleteCooldown.current ? 0.5 : 1, // Make it visually dim when disabled
              cursor: deleteCooldown.current ? "not-allowed" : "pointer", // Change cursor to indicate disabled state
            }}
          >
            <FontAwesomeIcon icon={faTrash} className="icon-size" />
          </span>
        </>
      ),
      sortable: false,
      filter: false, // No filtering for actions columns
      cellStyle: { textAlign: "center" },
      width: 100,
      // pinned: "right",
      // movable: false,
    },
  ];

  useEffect(() => {
    if (columnDefsApi && columnDefsApi.length > 0) {
      setTableHeader(columnDefs);
    }
  }, [columnDefsApi]);

  const filterTableData = () => {
    const filteredData = rowData
      .filter((apiDataRec) => {
        // Define filter conditions
        const matchesAdminRole = searchRcds.locationddo
          ? apiDataRec.locationddo === searchRcds.locationddo
          : true;

        // city name filter should only be applied if searchRcds.ddoName is provided
        const matchesRoleName = searchRcds.ddoName
          ? apiDataRec.ddoName
              .toLowerCase()
              .includes(searchRcds.ddoName.toLowerCase())
          : true; // If no roleName filter, include all role names

        const matchesRoleLevel = searchRcds.isMetro
          ? apiDataRec.isMetro === searchRcds.isMetro
          : true;

        // Return true if both conditions are met
        return matchesAdminRole && matchesRoleName && matchesRoleLevel;
      })
      .map((item, sno) => ({
        serialNo: sno + 1, // Serial Number (1-based)
        locationddo: item.locationddo,
        ddoName: item.ddoName,
        Id: item.Id,
      }));

    setTableData(filteredData);
    console.log(filteredData);

    setIsOpen(false);
  };

  const resetTable = () => {
    setrefreshAGGrid(true);
    setTableHeader(columnDefs);
    setTableData(rowData);
    setSelectedValues([]);
  };

  ///////////////////////////////////*************shortcuts**********////////////////////////////////////////////////////////

  useKeyboardShortcut(
    "S",
    (e) => {
      // Pass the event to the callback
      handleCreate(e); // Now `e` is available here
    },
    { ctrl: true }
  );

  useKeyboardShortcut(
    "R",
    () => {
      // Pass the event to the callback
      setReloadTableFlag(true);
      resetTable(); // Now `e` is available here

      // After 3 seconds, set the reload flag to false to hide the spinner
      setTimeout(() => {
        setReloadTableFlag(false);
      }, 600);
    },
    { alt: true }
  );

  useKeyboardShortcut(
    "S",
    () => {
      if (modalIsOpen) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    },
    { alt: true }
  );
  useKeyboardShortcut(
    "C",
    () => {
      if (customModalIsOpen) {
        setCustomModelIsOpen(false);
      } else {
        setCustomModelIsOpen(true);
      }
    },
    { alt: true }
  );

  ////////////////////////////////////////********Code for add remove headers********/////////////////////////////////////////////////////

  const [customModalIsOpen, setCustomModelIsOpen] = React.useState(false);

  function openModal() {
    setCustomModelIsOpen(true);
  }

  const [selectedValues, setSelectedValues] = useState([]);

  useEffect(() => {
    // changes
    resetTable();
  }, []);

  return (
    <>
      <div className="rightArea">
        <div className="container-fluid px-1">
          <Breadcrumbs />
        </div>

        <div className="container-body mx-3 mb-2">
          <form>
            <div className="row mb-3">
              <p className="card-title h6">
                {retrieveFromLocalStorage("pageName")}
              </p>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <SelectComponent
                      autofocus={true}
                      holder={data.uHolder}
                      label={data.uName}
                      selectedValue={rcds.locationddo}
                      resetValue={resetSelect}
                      options={locationRcds}
                      errorMessage={errorMessages.locationddo} // Pass the error message for roleLevel
                      onChange={handleChange}
                      onSelects={(value) =>
                        setRcds((prevState) => ({
                          ...prevState,
                          locationddo: value,
                        }))
                      }
                      icon={icon.star} // Example icon (FontAwesome star icon)
                    />
                  </div>
                  <div className="col-md-6">
                    <FormMultiSelect
                      holder={data.cholder}
                      label={data.cCity}
                      selectedValues={rcds.ddoName}
                      resetValue={resetSelect}
                      options={DdoTypeRcds}
                      errorMessage={errorMessages.ddoName} // Pass the error message for roleLevel
                      onSelects={(selectedValues) => {
                        setRcds((prevState) => ({
                          ...prevState,
                          ddoName: selectedValues, // Update the multi-select values in state
                        }));
                      }}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-12">
                    {showSave && (
                      <FormButton
                        btnType1={data.save}
                        btnType3={data.update}
                        btnType4={data.back}
                        btnType5={data.reset}
                        onClick={handleCreate}
                        onBack={handleBack}
                        onReset={handleReset}
                        showUpdate={!!rcds.locationddoId}
                        rcds={rcds}
                        loading={loading}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {errorVisibleComponent && (
          <ErrorMessageABD
            text={errorDivMessage}
            isSuccess={errorType}
            isVisible={errorVisibleComponent}
            setVisible={setErrorMessageVisibleComponent} // Pass the function to reset visibility
          />
        )}

        <div className="container-body mx-3 mb-3">
          <p className="h6 card-title list-header">
            {" "}
            <small>
              {" "}
              List of City detail<span className="parenthesis">(</span>s
              <span className="parenthesis">)</span>
            </small>
          </p>

          <div
            className="refresh-table "
            aria-label=""
            data-bs-toggle="tooltip"
            data-bs-placement="auto"
            title={`Refresh Data`}
            onClick={(e) => {
              e.preventDefault();

              // Set the reload flag to true to show the spinner
              setReloadTableFlag(true);

              // After 3 seconds, set the reload flag to false to hide the spinner
              setTimeout(() => {
                setReloadTableFlag(false);
              }, 600);

              // Reset the table (assuming resetTable is defined elsewhere)
              resetTable();
            }}
          >
            {reloadTableFlag ? (
              <div className="spinner-border text-primary" role="status"></div>
            ) : (
              <i className={`${icon.refresh} text-primary`}></i>
            )}
          </div>

          <div className="ag-theme-alpine">
            {/* <i
              onClick={openModal}
              className={icon.magnifyingglass}
            > */}
            <AdvanceSearchModal
              setSearchRcds={setSearchRcds}
              modalIsOpen={modalIsOpen}
              setIsOpen={setIsOpen}
            >
              <div className="card advanceSearchModal">
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-md-12">
                      <SelectComponent
                        autofocus={true}
                        holder="Select Location"
                        label={data.uName}
                        resetValue={resetSelect}
                        selectedValue={searchRcds.locationddo}
                        options={locationRcds}
                        errorMessage={errorMessages.locationddo} // Pass the error message for roleLevel
                        onSelects={(value) =>
                          setSearchRcds((prevState) => ({
                            ...prevState,
                            locationddo: value,
                          }))
                        }
                        icon={icon.star} // Example icon (FontAwesome star icon)
                      />
                    </div>
                  </div>

                  <div className="row mb-3 offset-3">
                    <div className="col-md-6 d-flex">
                      <button
                        className="me-1 btn btn-primary btn-color"
                        onClick={filterTableData}
                      >
                        Search
                      </button>
                      <button
                        className="btn btn-warning btn-color ms-2"
                        onClick={() => {
                          setSearchRcds({
                            locationddo: "",
                            ddoName: "",
                            isMetro: "",
                          });
                          resetTable();
                        }}
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </AdvanceSearchModal>

            <div
              className={`d-flex align-items-center p-2 border rounded-3 addRemoveButtoninCustomModal ${
                selectedValues.length === 0 ? "" : "addRemoveButtonHighlight"
              }`}
              tabIndex={1}
              onClick={openModal}
              aria-label=""
              data-bs-toggle="tooltip"
              data-bs-placement="auto"
            >
              <span>
                <i className={`${icon.column} me-2`}></i>
                Remove Column
              </span>
            </div>

            <CustomModal
              width="30%"
              left="55%"
              top="40%"
              setIsOpen={setCustomModelIsOpen}
              modalIsOpen={customModalIsOpen}
              header="Add to remove Column"
            >
              <div className="card advanceSearchModal">
                <div className="card-body">
                  <div className="row mb-3">
                    <FilterTags
                      columnDefs={columnDefs}
                      columnDefsApi={columnDefsApi}
                      setTableHeader={setTableHeader}
                      selectedValues={selectedValues}
                      setSelectedValues={setSelectedValues}
                    />
                  </div>
                </div>
              </div>
            </CustomModal>

            <AgGridTable
              rowData={tableData}
              columnDefs={tableHeader}
              hardRefreshFlag={refreshAGGrid}
              setrefreshAGGrid={setrefreshAGGrid}
              highlightRow={highlightRow}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default LocationDdoMappingMaster;
