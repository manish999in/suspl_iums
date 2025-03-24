import React , { useState, useEffect, useRef,useContext } from "react";
import "../styles/inputStyle.css";
import FormText from "../components/FormText";
import FormTextarea from "../components/FormTextarea";
import FormButton from "../components/FormButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import "../styles/AdvancedSearch.css";
import useCheckResponseStatus from "../hooks/useCheckResponseStatus";
import ErrorMessageABD from "../components/ErrorMessageABD";
import useKeyboardShortcut from "../hooks/useKeyboardShortcut";
import AdvanceSearchModal from '../components/AdvanceSearchModal';
import SelectComponent from "../components/SelectComponent";

import {
  retrieveFromCookies,
  retrieveFromLocalStorage,
} from "../utils/CryptoUtils";
;

import {
  getDelete,
  getList,
  getSave,
  getUpdate,
  getViewRecord,
} from "../utils/api";
import AgGridTable from "../components/AgGridTable";
import Breadcrumbs from "../components/Breadcrumbs";
import icon from "../properties/icon";
import CustomModal from "../components/CustomModal";
import FormCheckbox from "../components/FormCheckbox";
import FilterTags from "../components/FilterTags"
import { GlobalContext } from "../context/GlobalContextProvider";


const AssociationMaster = () => {

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

  const [resetSelect, setResetSelect] = useState(false); // State for manipulating dropdown and search

  const deleteCooldown = useRef(false);

  const [errorVisibleComponent, setErrorMessageVisibleComponent] =
    useState(false);
  const [errorType, setErrorType] = useState();
  const [isEditing, setIsEditing] = useState(false); // state initaialize

  const [errorDivMessage, setErrorDivMessage] = useState("");

  const [errorMessages, setErrorMessages] = useState({
    associationName: "",
    fees: "",


  }); // handling error

  // changes
  const [rcds, setRcds] = useState({
    associationId: "",
    associationName: "",
    fees: "",
    remarks: "",
    usedInPension:"",       // used here



    userId: "", // Initial value will be updated in useEffect
    publicIp: "", // Initial value will be updated in useEffect
    createdBy: "",
    modifiedBy: "",
  });


  const [, setS_UserId] = useState({
    userId: "",
    publicIp: "",
  });

  
  const secretKey = retrieveFromCookies("AESDecKey");
 
  const saveButtonRef = useRef(null); // Reference for the Save button

  const [searchRcds, setSearchRcds] = useState({
    associationId: "",
    associationName: "",
    fees: "",
    remarks: "",
    isActive:""  //changed

  });
  const [showSave, setShowSave] = useState(true);
  const [responseMessage, setResponseMessage] = useState("");
  const [loading, setLoading] = useState(false); // Loading state

  const { checkResponseStatus } = useCheckResponseStatus();

  const data = {
    uName: "Association Name",
    uHolder: "Association Name",
    cCity: "Fees",
    cholder: "Enter Fees",
    holders :"Used In Pension",
    bname:"Remarks",
    bholder:"Remarks",

    associationName: "associationName",
    fees: "fees",
    remarks:"remarks",
    isActive: "isActive",
  
    
    save: "Save",
    delete: "Delete",
    update: "Update",
    back: "Back",
    reset: "Reset",
  };
  const handleBack = () => {
    setHighlightRow(false)
    deleteCooldown.current = false;
    if (saveButtonRef.current) {
      saveButtonRef.current.scrollIntoView({ behavior: "smooth" });
    }

    // Alternatively, clear form data and reset state if needed
    setRcds({
        associationId: "",
        associationName: "",
        fees: "",
        remarks: "",
         userId: "",
    });

    setResetSelect(true); // for dropdown search

    setResponseMessage(""); // Clear any displayed messages
    setIsEditing(false);

  };

  const handleReset = () => {
    // Reset rcds to its initial state
    setRcds({
        associationId: null,
      associationName: "",
      
        fees: "",
      remarks: "",
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
    if (!rcds.associationName) errors.associationName = "Please Enter Association Name";
    if (!rcds.fees) errors.fees = "Please Enter Fee";
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
    setShowSave(false)

    const updatedRcds = {
      ...rcds,
      userId: s_user.userId, // Ensure userId is included
      publicIp: s_user.publicIp, // Ensure publicIp is included
      usedInPension: rcds.usedInPension === "Y" ? "Y" : "N", // Correctly set is_active

    };
    try {
      // Encrypt the updated rcds with the userId
      const ciphertext = encAESData(secretKey, updatedRcds);
      console.log("Encrypted Data: ", ciphertext);

      let responseData;

    

      if (rcds.associationId) {                 
        // Update the existing record
        deleteCooldown.current = false;
        const response = await getUpdate("hrms", "associationTypeMaster", ciphertext);
        responseData = checkResponseStatus(response);
      } else {
        // Send data to the backend
        const response = await getSave("hrms", "associationTypeMaster", ciphertext);
        responseData = checkResponseStatus(response);

      }

      if (responseData) {
        // Check if the operation was successful
        if (responseData.rType === "Y") {
          const jsonData = JSON.parse(responseData.rData);
          const decryptedData = decAESData(secretKey, jsonData);
        

          // Clear the form fields by resetting rcds to its initial state
          setRcds({
            // Replace with your initial state for rcds
            associationId: null,
            associationName: "",
            fees: "",
            remarks: "",
            usedInPension:"",
            userId: rcds.userId,
            publicIp: rcds.publicIp,
          });
          setResetSelect(true); // for dropdown search

          setErrorMessageVisibleComponent(true);
          setErrorType(true);
          setErrorDivMessage(responseData.rMessage);
            setShowSave(true)
       
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
      setResponseMessage("Error saving data: " + error.message);
    }finally {
      setLoading(false); // End loading state

      deleteCooldown.current = false; // Reset the cooldown after 3 seconds
      setShowSave(true);
      // Automatically hide the message after it has been shown
      setTimeout(() => {
        setErrorMessageVisibleComponent(false);
        setErrorDivMessage("");
      }, 4000);
      setLoading(false); // End loading state
      setHighlightRow(false)
    }
  };
  useEffect(() => {
    if (resetSelect) {
      // Reset the select component after render
      setResetSelect(false);
    }
  }, [resetSelect]);



  //   try {
  //     // Encrypt the searchRcds data
  //     const ciphertext = encAESData(secretKey, searchRcds);

  //     // Send request to get the list
  //     const response = await getList("hrms", "associationTypeMaster", ciphertext, {});

  //     console.log("Full response from backend:", response);
  //     const responseData = checkResponseStatus(response);

  //     console.log(responseData);

  //     if(responseData.rType==="Y"){if (responseData.rData) {
  //       const jsonData = JSON.parse(responseData.rData);
  //       const decryptedData = decAESData(secretKey, jsonData);
  //       console.log(decryptedData);
  //       setApiData(decryptedData.recData);
  //       //setRecordCounts(decryptedData.recData[0].count);
  //     }}
  //     else{
  //       if(responseData.rData==="no data available")
  //       {
  //         setApiData([]);
  //       }
  //     }

  //     setResponseMessage(
  //       "Data sent successfully: " + JSON.stringify(responseData)
  //     );
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //     setResponseMessage("Error fetching data: " + error.message);
  //   }
  // };
  
  const getData = async () => {
    try {
      const menuId = retrieveFromLocalStorage("activeMenuId");
      // Encrypt the searchRcds data
      const ciphertext = encAESData(secretKey, { menuId });

      // Send request to get the list
      const response = await getList("hrms", "associationTypeMaster", ciphertext);

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
               fees: item.fees.toFixed(2)   // fees is casted into decimal ...

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


 
  const viewRecord = async (associationId) => {
    deleteCooldown.current = true;
    try {
      setErrorMessages("");
      const ciphertext = encAESData(secretKey, { associationId });

      const response = await getViewRecord("hrms", "associationTypeMaster", ciphertext);

      const responseData = checkResponseStatus(response);

      if (responseData.rData) {
        const recJson = JSON.parse(responseData.rData);
        const decryptedData = decAESData(secretKey, recJson);

        console.log("Decrypted Data ",decryptedData)

        const dataToRec = JSON.parse(decryptedData.recData); // Assuming you want the first item

        const dataToSet = dataToRec[0];

        // Update rcds state with the decrypted data
        setRcds({
         associationId: dataToSet.associationId,
         associationName: dataToSet.associationName,
         fees: dataToSet.fees.toFixed(2),
         usedInPension:dataToSet.usedInPension,
         remarks:dataToSet.remarks,
         userId: s_user.userId, // Set userId here
         publicIp: s_user.publicIp, // Set publicIp here
        });
      } else {
        console.error("encryptData is undefined in the backend response.");
      }
    } catch (error) {
      console.error("Error retrieving data:", error);
    } finally {
    }
  };



  const handleDelete = async (associationId) => {
    deleteCooldown.current = true;
    setShowSave(false);
    setLoading(true);
  
    try {
      const ciphertext = encAESData(secretKey, { associationId });
      const response = await getDelete("hrms", "associationTypeMaster", ciphertext);
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
  
        // Use functional setState to always access the latest state
        setTableData((prevTableData) => {
          // Filter out the deleted item from the previous tableData
          const newData = prevTableData.filter((item) => item.associationId !== associationId);
  
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
      deleteCooldown.current = false;
  
      setTimeout(() => {
        setErrorMessageVisibleComponent(false);
        setErrorDivMessage("");
      }, 4000);
      setHighlightRow(false);
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
              const id = params.data.associationId; // Access the row data to get the roleId
             setHighlightRow(true);
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
                    setHighlightRow(true); //changes
                    const id = params.data.associationId; // Access row data to get the salId
                    handleDelete(id); // Call the handleDelete function with the salId
                    setHighlightRow(false); //changes

                  }
                  else{
                    setHighlightRow(false);
                  }
                
              }
            }}
            style={{
              pointerEvents: isEditing || deleteCooldown.current ? "none" : "auto", // Disable click
              opacity: isEditing || deleteCooldown.current ? 0.5 : 1, // Make it visually dim when disabled
              cursor: isEditing || deleteCooldown.current ? "not-allowed" : "pointer", // Change cursor to indicate disabled state
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


  // Update tableData whenever apiData changes
  
  useEffect(() => {
    if (columnDefsApi && columnDefsApi.length > 0) {
      setTableHeader(columnDefs);
    }
  }, [columnDefsApi]);

  const filterTableData = () => {

    const filteredData = rowData
    .filter((apiDataRec) => {
        // Define filter conditions
        const matchesAdminRole = searchRcds.isActive ? apiDataRec.isActive === searchRcds.isActive : true;

        // Role name filter should only be applied if searchRcds.roleName is provided
        const matchesRoleName = searchRcds.associationName
          ? apiDataRec.associationName.toLowerCase().includes(searchRcds.associationName.toLowerCase())
          : true; // If no roleName filter, include all role names


        const matchesRoleLevel = searchRcds.fees ? apiDataRec.fees === searchRcds.fees : true;


        // Return true if both conditions are met
        return matchesAdminRole && matchesRoleName && matchesRoleLevel;
      })
      .map((item, sno) => ({
        serialNo: sno + 1, 
        associationName: item.associationName,
        fees: item.fees,
        isActive: item.isActive  === 'Yes' ? 'Yes' : 'No',
        associationId:item.associationId,
        remarks      :item.remarks,
      }));

    setTableData(filteredData);
    setIsOpen(false);
  };


  const resetTable = () => {
    setrefreshAGGrid(true);
    setTableHeader(columnDefs);
    setTableData(rowData);
    setSelectedValues([]);
  }
  
  
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
                    <FormText
                     autofocus={true}
                    holder={data.uHolder}
                    name={data.associationName}
                    label={data.uName}
                      value={rcds[data.associationName]}
                      errorMessage={errorMessages.associationName} // Pass the error message for roleLevel
                      onChange={handleChange}
                      icon={icon.user} // Example icon (FontAwesome star icon)
 
                    />
                  </div>

                 
                  <div className="col-md-6">
                    <FormText
                     type="number"  // Set type to "number" for numeric input
                    label={data.cCity}
                      name={data.fees}
                      holder={data.cholder}
                      value={rcds[data.fees]}
                      errorMessage={errorMessages.fees} // Pass the error message for mappedAlias
                      onChange={handleChange}
                      icon={icon.default} // Example FontAwesome icon; change as neede
                      inputMode="numeric"  // Ensures mobile keyboards show numeric input options
                      Maxlength={10}


                    />
                    
                  </div>
                </div>
    

                <div className="row mb-3">
                  
                  <div className="col-md-6">
                  <FormCheckbox
                    label={data.holders}
                    name={rcds.usedInPension}
                    checked={rcds.usedInPension === "Y"} // Check if isAdmin is "Y" for checked
                    onChange={(evt) => {
                      if (evt && evt.target) {
                        const { checked } = evt.target; // Get the checked state
                        setRcds((prevState) => ({
                          ...prevState,
                          usedInPension: checked ? "Y" : "N", // Update isAdmin based on checked state
                        }));
                      }
                    }}
                    errorMessage={errorMessages.usedInPension} // Pass the error message if applicable
                  />
                  </div>

                 
                  <div className="col-md-6">
                    <FormTextarea
                     label={data.bname}
                      name={data.remarks}
                      value={rcds[data.remarks]}
                      holder={data.bholder}
                      errorMessage={errorMessages.remarks} // Pass the error message for roleLevel
                      onChange={handleChange}
                    //   icon={icon.star}// Example icon (FontAwesome star icon)
                      Maxlength={25}

                    />
                  </div>
                </div>

              

                <div className="row">
                  <div className="col-md-12">
                  {
                      showSave &&  <FormButton
                      btnType1={data.save}
                      btnType3={data.update}
                      btnType4={data.back}
                      btnType5={data.reset}
                      onClick={handleCreate}
                      onBack={handleBack}
                      onReset={handleReset}
                      showUpdate={!!rcds.associationId}
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
              List of Association detail<span className="parenthesis">(</span>s
              <span className="parenthesis">)</span>
            </small>
          </p>


          <div
            className="refresh-table "
            aria-label="" 
            data-bs-toggle="tooltip"
             data-bs-placement="auto" 
             title={`Refresh Table Data {Shift + R}`}
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
                    <div className="col-md-12">
                    <FormText
                     autofocus={true}
                    holder={data.uHolder}
                    name={data.associationName}
                    label={data.uName}
                      value={searchRcds[data.associationName]}
                      errorMessage={errorMessages.associationName} // Pass the error message for roleLevel
                      onChange={handleSearchChange}
                      icon={icon.user} // Example icon (FontAwesome star icon)
 
                    />
                    </div>

                    <div className="col-md-6">
                   
                       <FormText
                    label={data.cCity}
                      name={data.fees}
                      holder={data.cholder}
                      value={searchRcds[data.fees]}
                      errorMessage={errorMessages.fees} // Pass the error message for mappedAlias
                      onChange={handleSearchChange}
                      icon={icon.default} // Example FontAwesome icon; change as needed

                    />
                    </div>

                    <div className="col-md-6">
                       <SelectComponent
                        label="Is Pensioned ?"
                        name={data.isActive}
                        selectedValue={searchRcds.isActive}
                        resetValue={resetSelect}
                        onSelects={(value) =>
                          setSearchRcds((prevState) => ({
                            ...prevState,
                            isActive: value,
                          }))
                        }
                        icon={icon.arrowDown} // Example icon class for FontAwesome
                        options={[
                          { value: "Yes", label: "Yes" },
                          { value: "No", label: "No" },
                        ]}
                      /> 
                    </div>
                  </div>

                  <div className="row mb-3 offset-3">
                  <div className="col-md-6 d-flex">
                      <button className="me-1 btn btn-primary btn-color"
                        onClick={filterTableData}
                      >Search</button>
                      <button className="btn btn-warning btn-color ms-2"
                        onClick={
                          () => {
                            setSearchRcds({
                             associationName: "",
                             fees: "",
                             isActive:""

                            })
                            resetTable();
                          }
                        }

                      >Reset</button>
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

export default AssociationMaster;
