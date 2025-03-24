import React, { useState, useEffect, useRef, useContext } from "react";
import "../styles/inputStyle.css";
import FormText from "../components/FormText";
import FormTextarea from "../components/FormTextarea";
import FormButton from "../components/FormButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import "../styles/AdvancedSearch.css";
import useCheckResponseStatus from "../hooks/useCheckResponseStatus";
import ErrorMessageABD from "../components/ErrorMessageABD";


import {
  getDelete,
  getList,
  getSave,
  getUpdate,
  getViewRecord,
  getRecordByCount
} from "../utils/api";
import AgGridTable from "../components/AgGridTable";
import icon from "../properties/icon";
import { retrieveFromLocalStorage, retrieveFromCookies, storeInLocalStorage } from "../utils/CryptoUtils";

import Breadcrumbs from "../components/Breadcrumbs";
import AdvanceSearchModal from "../components/AdvanceSearchModal";
import useKeyboardShortcut from "../hooks/useKeyboardShortcut";
import FormMultiSelect from "../components/FormMultiSelect";
import CustomModal from "../components/CustomModal";
import { GlobalContext } from "../context/GlobalContextProvider";
import FilterTags from "../components/FilterTags";


const DDOMaster = () => {


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

  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [showSave, setShowSave] = useState(true);
  const deleteCooldown = useRef(false);


  const [errorMessages, setErrorMessages] = useState({
    ddoName: "",
    ddoCode: "",
  }); // handling error


  // changes
  const [rcds, setRcds] = useState({
    ddoId: "",
    ddoName: "",
    ddoCode: "",
    remarks: "",
    userId: "", // Initial value will be updated in useEffect
    publicIp: "", // Initial value will be updated in useEffect
    createdBy: "",
    modifiedBy: "",
  });

  const [errorVisibleComponent, setErrorMessageVisibleComponent] =
    useState(false);
  const [errorType, setErrorType] = useState();
  const [errorDivMessage, setErrorDivMessage] = useState("");



  const secretKey = retrieveFromCookies("AESDecKey");



  const saveButtonRef = useRef(null); // Reference for the Save button

  const [searchRcds, setSearchRcds] = useState({
    ddoName: "",
    ddoCode: "",
  });

  const [loading, setLoading] = useState(false); // Loading state
  const { checkResponseStatus } = useCheckResponseStatus();

  const data = {
    dName: "DDO Name",
    dHolder: "Enter DDO",
    dCode: "DDO CODE",
    DHolder: "Enter Code",
    remarks: "Remarks",
    placeholder: "Enter Remarks",
    remark: "remarks",
    isAdmin: "Is Admin Role?",
    save: "Save",
    delete: "Delete",
    update: "Update",
    back: "Back",
    reset: "Reset",
  };
  const handleBack = () => {
    deleteCooldown.current = false;

    setHighlightRow(false); // changes

    // Scroll back to the save button
    if (saveButtonRef.current) {
      saveButtonRef.current.scrollIntoView({ behavior: "smooth" });
    }

    // Alternatively, clear form data and reset state if needed
    setRcds({
      ddoName: "",
      ddoCode: "",
      remarks: "",
      userId: "",
    });



  };

  const handleReset = () => {
    // Reset rcds to its initial state
    setRcds({
      ddoId: rcds.ddoId,
      ddoName: "",
      ddoCode: "",
      remarks: "",
    });

    setErrorMessages("");
  };

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setRcds((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    setErrorMessages((prevMessage) => ({
      ...prevMessage,
      [name]: "",
    }));
  };

  const handleSearchChange = (evt) => {
    const { name, value, type, checked } = evt.target;
    setSearchRcds((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validate = () => {
    const errors = {};
    if (!rcds.ddoName) errors.ddoName = "DDO Name is required";
    if (!rcds.ddoCode) errors.ddoCode = "DDO Code is required";

    return errors;
  };

  const handleCreate = async (evt) => {
    let response;
    setShowSave(false)
    evt.preventDefault(); // Prevent default form submission
    setLoading(true); // Start loading state

    try {
      const errors = validate();
      if (Object.keys(errors).length > 0) {
        setErrorMessages(errors);
        setLoading(false);
        setShowSave(true);
        return;
      }
      // Prepare data for the API call, including userId and publicIp
      const updatedRcds = {
        ...rcds,
        userId: s_user.userId, // Ensure userId is included
        publicIp: s_user.publicIp, // Ensure publicIp is included
      };

      // Encrypt the updated rcds with the userId
      const ciphertext = encAESData(secretKey, updatedRcds);
      console.log("Encrypted Data: ", ciphertext);

      let responseData;

      if (rcds.ddoId) {
        // Update the existing record
        response = await getUpdate("user", "ddoMaster", ciphertext);
        console.log("Update response from backend:", response.data);
        // responseData = response.data;

        responseData = checkResponseStatus(response);
      } else {
        // Send data to the backend
        const response = await getSave("user", "ddoMaster", ciphertext);
        console.log("Response from backend:", response.data);
        responseData = checkResponseStatus(response);
      }

      console.log(responseData, "response");

      setRcds({
        // Replace with your initial state for rcds
        ddoId: null,
        ddoName: "",
        ddoCode: "",
        remarks: "",
        userId: rcds.userId,
        publicIp: rcds.publicIp,
      });

      if (responseData.rType) {
        const jsonData = JSON.parse(responseData.rData);
        const decryptedData = decAESData(secretKey, jsonData);
        console.log("Decrypted Data:", decryptedData);

        // Check if the operation was successful
        if (responseData.rType === "Y") {
          // Clear the form fields by resetting rcds to its initial state
          setErrorMessageVisibleComponent(true);
          setErrorType(true);
          setErrorDivMessage(responseData.rMessage);
          setShowSave(true);
          setTimeout(() => {
            setErrorMessageVisibleComponent(false);
            setErrorDivMessage("");

          }, 4000);



        } else {
          setErrorMessageVisibleComponent(true);
          setErrorType(true);
          setErrorDivMessage(responseData.rMessage);
        }

        getData();
      }
      else {
        setErrorMessageVisibleComponent(true);
        setErrorDivMessage(responseData.rMessage);

        setShowSave(true);
        setTimeout(() => {
          setErrorMessageVisibleComponent(false);
          setErrorDivMessage("");

        }, 4000);

      }
    } catch (error) {
      console.error("Error during create/update:", error);
      setErrorMessageVisibleComponent(true);
      setErrorType(false);
      setErrorDivMessage(response.data.rMessage);
    } finally {
      setLoading(false);
      setHighlightRow(false); // changes

    }
  };



  const getData = async () => {
    try {
      const menuId = retrieveFromLocalStorage("activeMenuId");
      const ciphertext = encAESData(secretKey, { menuId });

      // Send request to get the list
      const response = await getList("user", "ddoMaster", ciphertext);

      const responseData = checkResponseStatus(response);

      console.log(responseData);



      if (responseData.rType === "Y") {
        if (responseData.rData) {
          const jsonData = JSON.parse(responseData.rData);
          const decryptedData = decAESData(secretKey, jsonData);

          console.log(decryptedData);

          const header = JSON.parse(decryptedData.recData.header);

          let updatedData = [];
          if (decryptedData.recData.data) {
            const dataRec = JSON.parse(decryptedData.recData.data);

            // Add serialNo to the data
            updatedData = dataRec.map((item, index) => ({
              ...item,
              serialNo: index + 1, // Auto-increment serialNo
            }));
          }


          const updatedHeader = header
            .sort((a, b) => {
              if (a.order_by < b.order_by) return -1;  // a comes before b if a.order_by is less than b.order_by
              if (a.order_by > b.order_by) return 1;   // b comes before a if a.order_by is greater than b.order_by
              return 0;                                 // if both are equal, no change in order
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

          console.log(updatedHeader);

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
    getData();
    window.scrollTo({ top: 0, behavior: "smooth" });

  }, []);

  const viewRecord = async (ddoId) => {
    try {
      deleteCooldown.current = true;

      const ciphertext = encAESData(secretKey, { ddoId });

      const response = await getViewRecord("user", "ddoMaster", ciphertext);

      console.log("Full response from backend:", response);
      const responseData = checkResponseStatus(response);

      if (responseData.rData) {
        const recJson = JSON.parse(responseData.rData);
        const decryptedData = decAESData(secretKey, recJson);
        console.log("Decrypted Data:", decryptedData);


        const dataToRec = JSON.parse(decryptedData.recData); // Assuming you want the first item

        const dataToSet = dataToRec[0];

        // Update rcds state with the decrypted data
        setRcds({
          ddoId: dataToSet.ddoId,
          ddoName: dataToSet.ddoName,
          ddoCode: dataToSet.ddoCode,
          remarks: dataToSet.remarks,
          publicIp: s_user.publicIp, // Use publicIp from s_userId
          userId: s_user.userId, // Use userId from s_userId
        });
      } else {
        console.error("encryptData is undefined in the backend response.");
      }


    } catch (error) {
      console.error("Error retrieving data:", error);
    }
  };

  const handleDelete = async (ddoId) => {
    deleteCooldown.current(true);
    setShowSave(false);
    setLoading(true);

    try {
      const ciphertext = encAESData(secretKey, { ddoId });
      const response = await getDelete("user", "ddoMaster", ciphertext);
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

        console.log(rowData);

        // Use functional setState to always access the latest state
        setTableData((prevTableData) => {
          // Filter out the deleted item from the previous tableData
          const newData = prevTableData.filter((item) => item.ddoId !== ddoId);

          // Map to reset serialNo after deletion
          const updatedTableData = newData.map((item, index) => ({
            ...item,
            serialNo: index + 1, // Recalculate serialNo
          }));
          // Update rowData as well
          setRowData(updatedTableData); // Ensure both state updates are in sync
          return updatedTableData; // Return updated data to be set for tableData
        });

      } else {
        setErrorMessageVisibleComponent(true);
        setErrorType(false);
        setErrorDivMessage(response.data.rMessage);
      }
    } catch (error) {
      console.error("Error deleting data:", error);
    } finally {
      setLoading(false);
      setShowSave(true);
      deleteCooldown.current(false);

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
      cellRenderer: (params) => (
        <>
          <span
            // tabIndex={1}
            className="manipulation-icon edit-color mx-3"
            onClick={() => {
              const id = params.data.ddoId; // Access the row data to get the roleId
              setHighlightRow(true); //changes
              viewRecord(id); // Call viewRecord function with the id
              window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to the top
            }}
          >
            <FontAwesomeIcon icon={faEdit} className="icon-size" />
          </span>

          <span
            // tabIndex={1}
            className={`manipulation-icon delete-color ${deleteCooldown.current ? "disabled" : ""
              } mx-1`}
            onClick={() => {
              if (!deleteCooldown.current) {
                // Show confirmation alert
                const confirmDelete = window.confirm(
                  "Are you sure you want to delete this record?"
                );
                if (confirmDelete) {
                  if (!deleteCooldown.current) {
                    setHighlightRow(true); //changes
                    const id = params.data.ddoId; // Access row data to get the salId
                    handleDelete(id); // Call the handleDelete function with the salId
                  }
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

  //////////////////////////**** new header format *///////////////////////////////////

  useEffect(() => {
    if (columnDefsApi && columnDefsApi.length > 0) {
      setTableHeader(columnDefs);
    }
  }, [columnDefsApi]);



  const filterTableData = () => {

    const filteredData = rowData
      .filter((apiDataRec) => {
        // Define filter conditions
        const matchesDdoCode = searchRcds.ddoCode
          ? apiDataRec.ddoCode.toLowerCase().includes(searchRcds.ddoCode.toLowerCase())
          : true;

        const matchesDdoName = searchRcds.ddoName
          ? apiDataRec.ddoName.toLowerCase().includes(searchRcds.ddoName.toLowerCase())
          : true;

        // Return true if both conditions are met
        return matchesDdoCode && matchesDdoName;
      })
      .map((item, sno) => ({
        serialNo: sno + 1,
        ddoName: item.ddoName,
        ddoCode: item.ddoCode,
        remarks: item.remarks,
        ddoId: item.ddoId,
      }));

    console.log(filteredData);

    setTableData(filteredData);
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
    (e) => { // Pass the event to the callback
      handleCreate(e); // Now `e` is available here
    },
    { ctrl: true }
  );

  useKeyboardShortcut(
    "R",
    () => { // Pass the event to the callback // Set the reload flag to true to show the spinner
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

  ///////////////////////////////////********Code for add remove headers********/////////////////////////////////////////////////////


  const [customModalIsOpen, setCustomModelIsOpen] = React.useState(false);

  function openModal() {
    setCustomModelIsOpen(true);
  }

  const [selectedValues, setSelectedValues] = useState([]);

  return (
    <>
      <div className="rightArea">
        <div className="container-fluid px-1">
          <Breadcrumbs />
        </div>
        <div className="container-body mx-3 mb-2">
          <form action="" className="mb-5">
            <div className="row mb-3">
              <p className="card-title h6">
                {retrieveFromLocalStorage("pageName")}
              </p>
            </div>
            <div className="card">


              <div className="card-body">
                <div className="row mb-3">

                  <div className="col-md-6">
                    <FormText
                      autofocus={true}
                      label={data.dName}
                      name="ddoName" // Match this with rcds key
                      holder={data.dHolder}
                      value={rcds.ddoName} // Accessing the state value
                      onChange={handleChange}
                      errorMessage={errorMessages.ddoName}
                      icon={icon.default}
                      Maxlength={30}
                    />
                  </div>


                  <div className="col-md-6">
                    <FormText
                      label={data.dCode}
                      name="ddoCode"
                      holder={data.DHolder}
                      value={rcds.ddoCode}
                      onChange={handleChange}
                      errorMessage={errorMessages.ddoCode}
                      icon={icon.user}
                      Maxlength={3}
                    />
                  </div>
                </div>

                <div className="row mb-2">

                  <div className="col-md-12">
                    <FormTextarea
                      label={data.remarks}
                      holder={data.placeholder}
                      name={data.remark}
                      value={rcds[data.remark]}
                      icon={icon.default}
                      onChange={handleChange}
                      Maxlength={250}
                    />
                  </div>
                </div>

                <div className="row">
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
                        showUpdate={!!rcds.ddoId}
                        rcds={rcds}
                        loading={loading}
                      />
                    }
                  </div>
                </div>
              </div>

            </div>
          </form>
        </div>
        {errorVisibleComponent && (
          <div className="d-flex justify-content-center align-items-center my-4">
            <ErrorMessageABD
              text={errorDivMessage}
              isSuccess={errorType}
              isVisible={errorVisibleComponent}
              setVisible={setErrorMessageVisibleComponent} // Pass the function to reset visibility
            />
          </div>
        )}
        <div className="container-body mx-3 mb-3">
          <p className="h6 card-title list-header">
            {" "}
            <small>
              {" "}
              List of DDO detail<span className="parenthesis">(</span>s
              <span className="parenthesis">)</span>
            </small>
          </p>


          <div

            className="refresh-table "
            id="refresh-table"
            aria-label="" data-bs-toggle="tooltip" data-bs-placement="auto" title={`Refresh Data {Shift + R}`}
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
            {
              reloadTableFlag ? (
                <div className="spinner-border text-primary" role="status">
                </div>
              ) : (
                <i className={`${icon.refresh} text-primary`}></i>
              )
            }
          </div>




          <div className="ag-theme-alpine">
            {/* <i
              onClick={openModal}
              className={icon.magnifyingglass}
            > */}

            <AdvanceSearchModal
              setSearchRcds={setSearchRcds}
              modalIsOpen={modalIsOpen}
              setIsOpen={setIsOpen}>

              <div className="card advanceSearchModal">
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-md-6">

                      <FormText
                        autofocus={true}
                        label={data.dName}
                        name="ddoName"
                        holder={data.dHolder}
                        value={searchRcds.ddoName}
                        // errorMessage={errorMessages.roleName} // Pass the error message for roleName
                        onChange={handleSearchChange}
                        icon={icon.user} // Example FontAwesome icon; change as needed

                      />
                    </div>

                    <div className="col-md-6">
                      <FormText
                        label={data.dCode}
                        name="ddoCode"
                        holder={data.DHolder}
                        value={searchRcds.ddoCode}
                        // errorMessage={errorMessages.roleName} // Pass the error message for roleName
                        onChange={handleSearchChange}
                        icon={icon.user} // Example FontAwesome icon; change as needed

                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-12 d-flex justify-content-center align-items-center">
                      <button
                        className="me-1 btn btn-primary btn-color btn-sm"
                        onClick={filterTableData}
                      >
                        Search
                      </button>
                      <button
                        className="btn btn-warning btn-color btn-sm ms-2"
                        onClick={() => {
                          setSearchRcds({
                            semester: "",
                            alias: "",
                            isActive: "",
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
              className={`d-flex align-items-center p-2 border rounded-3 addRemoveButtoninCustomModal ${selectedValues.length === 0 ? '' : 'addRemoveButtonHighlight'}`}
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

export default DDOMaster;

